from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer


def set_refresh_cookie(response, token):
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=token,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,               # JavaScript can't read it
        secure=not settings.DEBUG,   # HTTPS-only in production
        samesite="Lax",              # not sent with requests from other sites
        path=settings.REFRESH_COOKIE_PATH,
    )


class PublicAuthView:
    """
    Base for endpoints used *before* the user has a valid access token.
    No authentication runs here, so an expired access token can't block a refresh.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get_authenticate_header(self, request):
        # Makes failed logins answer 401 (not logged in) instead of 403 (forbidden).
        return 'Bearer realm="api"'


class RegisterView(PublicAuthView, generics.CreateAPIView):
    """POST email, name, password -> creates an account."""

    serializer_class = RegisterSerializer
    throttle_scope = "auth"


class LoginView(PublicAuthView, APIView):
    """POST email, password -> access token in the body, refresh token in a cookie."""

    throttle_scope = "auth"

    def post(self, request):
        serializer = TokenObtainPairSerializer(
            data={
                "email": str(request.data.get("email", "")).lower(),
                "password": request.data.get("password", ""),
            },
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)  # wrong password -> 401
        response = Response(
            {
                "access": serializer.validated_data["access"],
                "user": UserSerializer(serializer.user).data,
            }
        )
        set_refresh_cookie(response, serializer.validated_data["refresh"])
        return response


class RefreshView(PublicAuthView, APIView):
    """POST (no body) -> uses the cookie to issue a new access token."""

    def post(self, request):
        token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if not token:
            raise InvalidToken("No refresh token. Please log in.")
        serializer = TokenRefreshSerializer(data={"refresh": token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as error:  # expired, tampered with, or already used
            raise InvalidToken(str(error)) from error
        response = Response({"access": serializer.validated_data["access"]})
        if "refresh" in serializer.validated_data:
            set_refresh_cookie(response, serializer.validated_data["refresh"])
        return response


class LogoutView(PublicAuthView, APIView):
    """POST -> the refresh token is blacklisted and the cookie removed."""

    def post(self, request):
        token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if token:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                pass  # already expired or blacklisted: nothing left to undo
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(settings.REFRESH_COOKIE_NAME, path=settings.REFRESH_COOKIE_PATH)
        return response


class MeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH the logged-in user's own profile."""

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)