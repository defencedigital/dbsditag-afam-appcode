FROM registry.access.redhat.com/ubi9/nginx-122:1-17

# Switch to Root to update 
USER 0

# Uninstalling BIND to avoid CVE-2023-2828, CVE-2023-2828 & CVE-2023-2828
# NGINX shouldn't need BIND, unless it's specfically doing DNS related things (famous last words)
RUN rpm -e bind-license-9.16.23-11.el9.noarch bind-libs-9.16.23-11.el9.x86_64 bind-utils-9.16.23-11.el9.x86_64

# Switch back the default user
USER 1001

# COPY application sources
COPY nginx-conf/nginx.conf "${NGINX_CONF_PATH}"
COPY nginx-conf/nginx-default-cfg/*.conf "${NGINX_DEFAULT_CONF_PATH}"
COPY nginx-conf/nginx-cfg/*.conf "${NGINX_CONFIGURATION_PATH}"
COPY nginx-conf/*.html .
COPY nginx-conf/logging.conf /opt/app-root/etc/nginx.d/logging.conf
COPY govuk-frontend/assets /opt/app-root/src/assets
COPY govuk-frontend/govuk-frontend-4.0.0.min.css /opt/app-root/src/govuk-frontend-4.0.0.min.css
COPY govuk-frontend/govuk-frontend-4.0.0.min.js /opt/app-root/src/govuk-frontend-4.0.0.min.js
COPY govuk-frontend/govuk-frontend-ie8-4.0.0.min.css /opt/app-root/src/govuk-frontend-ie8-4.0.0.min.css

# Run script uses standard ways to run the application
CMD nginx -g "daemon off;"
