#!/usr/bin/env python

import sys
import site

site.addsitedir('/usr/lib/python3.6/site-packages/')

sys.path.insert(0, '/var/www/html/')
sys.path.insert(0, '/var/www/html/api')

from app import app as application
