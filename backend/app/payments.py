"""Payment gateway boundary.

Real payment must remain disabled until a merchant supplies credentials and the official
provider contract is verified. This module deliberately does not simulate a successful charge.
"""
from dataclasses import dataclass


@dataclass
class PaymentUnavailable(Exception):
    message: str = "درگاه پرداخت هنوز تنظیم و تأیید نشده است."


class PaymentProvider:
    async def create(self, *, order_code: str, amount_toman: int, callback_url: str) -> dict:
        raise PaymentUnavailable()

    async def verify(self, *, authority: str, amount_toman: int) -> dict:
        raise PaymentUnavailable()


def get_payment_provider() -> PaymentProvider:
    # Zarinpal/Zibal adapters are added only after merchant configuration and API contract review.
    raise PaymentUnavailable()