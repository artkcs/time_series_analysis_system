# Generated by Django 5.0.4 on 2024-05-22 07:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='integration',
            name='last_updated',
            field=models.DateTimeField(null=True),
        ),
    ]
