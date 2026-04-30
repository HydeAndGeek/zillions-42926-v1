#!/usr/bin/env bash
# Build step: generate JSON manifests from markdown files.
# Runs on Netlify before deploy.
set -e
python3 build.py
