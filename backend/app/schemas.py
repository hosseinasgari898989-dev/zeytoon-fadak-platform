from typing import Any

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator


class OrderLineInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    pid: str = Field(min_length=1, max_length=80)
    vi: int = Field(ge=0, le=40)
    qty: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=10, max_length=20)
    city: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(default="", max_length=20, validation_alias=AliasChoices("postalCode", "postal_code"))
    address: str = Field(min_length=5, max_length=1500)
    notes: str = Field(default="", max_length=1000)
    delivery: str = Field(min_length=2, max_length=100)
    payment: str = Field(min_length=2, max_length=100)
    items: list[OrderLineInput] = Field(min_length=1, max_length=60)


class TrackOrderInput(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    code: str = Field(min_length=4, max_length=32)
    phone_last4: str = Field(validation_alias=AliasChoices("phoneLast4", "phone_last4"), min_length=4, max_length=4)


class StateWrite(BaseModel):
    model_config = ConfigDict(extra="forbid")
    state: dict[str, Any]


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(default="", max_length=160)
    phone: str = Field(default="", max_length=20)
    business: str = Field(default="", max_length=180)
    city: str = Field(default="", max_length=100)
    email: str = Field(default="", max_length=200)
    subject: str = Field(default="", max_length=160)
    message: str = Field(default="", max_length=3000)
    monthlyUse: str = Field(default="", max_length=200)
    notes: str = Field(default="", max_length=1000)
    honey: str = Field(default="", max_length=200)


class ProductUpsert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    category: str = Field(min_length=1, max_length=40)
    name: str = Field(min_length=2, max_length=240)
    description: str = Field(default="", max_length=1500)
    long_description: str = Field(default="", max_length=4000)
    tag: str = Field(default="", max_length=80)
    variants: list[dict[str, Any]] = Field(min_length=1, max_length=40)
    active: bool = True


class OrderStatusUpdate(BaseModel):
    status: str = Field(min_length=2, max_length=32)
    note: str = Field(default="", max_length=500)


class PosEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    date: str = ""
    amount: int = Field(ge=0)
    reference: str = Field(min_length=1, max_length=120)
    terminal: str = Field(default="", max_length=120)
    store: str = Field(default="", max_length=120)
    note: str = Field(default="", max_length=500)