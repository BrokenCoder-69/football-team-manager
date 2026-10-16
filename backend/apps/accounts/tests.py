from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User

PASSWORD = "turf-night-2026"
COOKIE = "refresh_token"


class RegisterTests(APITestCase):
    def test_register_creates_user_with_hashed_password(self):
        response = self.client.post(
            reverse("register"),
            {"email": "Rafi@Example.com", "name": "Rafi", "password": PASSWORD},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", response.data)
        user = User.objects.get(email="rafi@example.com")  # stored lowercase
        self.assertNotEqual(user.password, PASSWORD)        # stored as a hash

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(email="rafi@example.com", name="Rafi", password=PASSWORD)
        response = self.client.post(
            reverse("register"),
            {"email": "RAFI@example.com", "name": "Other", "password": PASSWORD},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_password_is_rejected(self):
        response = self.client.post(
            reverse("register"),
            {"email": "new@example.com", "name": "New", "password": "12345678"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)


class LoginAndTokenTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="rafi@example.com", name="Rafi", password=PASSWORD
        )

    def login(self, email="rafi@example.com", password=PASSWORD):
        return self.client.post(reverse("login"), {"email": email, "password": password})

    def test_login_gives_access_token_and_httponly_cookie(self):
        response = self.login(email="RAFI@example.com")  # any casing works
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertNotIn("refresh", response.data)  # never visible to JavaScript
        self.assertEqual(response.data["user"]["name"], "Rafi")
        self.assertTrue(response.cookies[COOKIE]["httponly"])

    def test_wrong_password_is_401(self):
        response = self.login(password="wrong-password")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_token_opens_profile(self):
        access = self.login().data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "rafi@example.com")

    def test_profile_requires_login(self):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_rotates_and_old_token_stops_working(self):
        self.login()
        old_token = self.client.cookies[COOKIE].value

        response = self.client.post(reverse("token-refresh"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertNotEqual(self.client.cookies[COOKIE].value, old_token)

        # Someone replaying the old token is refused.
        self.client.cookies[COOKIE] = old_token
        response = self.client.post(reverse("token-refresh"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_without_cookie_is_401(self):
        response = self.client.post(reverse("token-refresh"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_kills_the_refresh_token(self):
        self.login()
        token = self.client.cookies[COOKIE].value
        response = self.client.post(reverse("logout"))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Even if someone kept a copy of the token, it no longer works.
        self.client.cookies[COOKIE] = token
        response = self.client.post(reverse("token-refresh"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileAndPasswordTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="rafi@example.com", name="Rafi", password=PASSWORD
        )
        self.client.force_authenticate(self.user)  # skip login for these tests

    def test_email_cannot_be_changed_through_profile(self):
        response = self.client.patch(
            reverse("me"), {"email": "other@example.com", "phone": "01700000000"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "rafi@example.com")
        self.assertEqual(self.user.phone, "01700000000")

    def test_change_password(self):
        response = self.client.post(
            reverse("change-password"),
            {"current_password": "wrong", "new_password": "friday-8pm-kickoff"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(
            reverse("change-password"),
            {"current_password": PASSWORD, "new_password": "friday-8pm-kickoff"},
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("friday-8pm-kickoff"))