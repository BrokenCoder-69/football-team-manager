from django.db import models


class TimeStampedModel(models.Model):
    """Adds created_at and updated_at to any model that inherits from it."""

    created_at = models.DateTimeField(auto_now_add=True)  # set once, on creation
    updated_at = models.DateTimeField(auto_now=True)      # set on every save

    class Meta:
        abstract = True  # no table of its own; only its children get tables