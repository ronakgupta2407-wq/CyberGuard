import pytest
from app.services.website_checker import WebsiteChecker

def test_ssrf_blocking_loopback_and_private_ips():
    # Loopback IP
    assert WebsiteChecker.is_private_or_restricted_ip("127.0.0.1") is True
    assert WebsiteChecker.is_private_or_restricted_ip("127.0.1.5") is True
    assert WebsiteChecker.is_private_or_restricted_ip("::1") is True

    # RFC 1918 Private IPs
    assert WebsiteChecker.is_private_or_restricted_ip("10.0.0.1") is True
    assert WebsiteChecker.is_private_or_restricted_ip("172.16.0.1") is True
    assert WebsiteChecker.is_private_or_restricted_ip("192.168.1.1") is True

    # Link-local AWS metadata IP
    assert WebsiteChecker.is_private_or_restricted_ip("169.254.169.254") is True

    # Public IP
    assert WebsiteChecker.is_private_or_restricted_ip("8.8.8.8") is False
    assert WebsiteChecker.is_private_or_restricted_ip("1.1.1.1") is False

def test_ssrf_exception_raised_on_localhost():
    with pytest.raises(PermissionError):
        WebsiteChecker.sanitize_and_resolve("http://localhost:8080/admin")

    with pytest.raises(PermissionError):
        WebsiteChecker.sanitize_and_resolve("http://127.0.0.1:5000")
