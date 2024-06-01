# Generated by Django 5.0.4 on 2024-05-17 11:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Integration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('http_url', models.CharField(max_length=400, null=True)),
                ('type', models.IntegerField()),
                ('data_type', models.IntegerField()),
                ('mqtt_broker', models.CharField(max_length=400, null=True)),
                ('mqtt_topic', models.CharField(max_length=400, null=True)),
                ('mqtt_port', models.CharField(max_length=10, null=True)),
                ('owner', models.CharField(default='system', max_length=200)),
                ('periodicity', models.FloatField(default=0)),
                ('dateformat', models.CharField(default='%Y-%m-%d %H:%M:%S', max_length=100)),
                ('json_path', models.CharField(max_length=100, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='IntegrationFields',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('field_name', models.CharField(max_length=100)),
                ('integ_field_name', models.CharField(max_length=100)),
                ('field_type', models.CharField(max_length=100, null=True)),
                ('integration', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.integration')),
            ],
        ),
    ]
