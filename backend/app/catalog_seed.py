from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Product

CATEGORIES = [
    {"id": "olive", "n": "زیتون", "d": "شیشه‌ای؛ سبز، سیاه، پرورده و بی‌هسته"},
    {"id": "oil", "n": "روغن زیتون", "d": "فرابکر در بطری شیشه‌ای و حلب"},
    {"id": "vacuum", "n": "زیتون وکیوم", "d": "نرم، سبک و آماده‌ی مصرف"},
    {"id": "canned", "n": "زیتون کنسرو شده", "d": "برای پیتزا، ساندویچ و آشپزی"},
]

CATALOG = [
    {"id":"o1","category":"olive","name":"زیتون سبز درشت شیشه‌ای","description":"زیتون سبز درشت با هسته در آب‌نمک؛ مناسب میز صبحانه و سالاد.","tag":"پرفروش","variants":[{"l":"۷۰۰ گرم","p":220000,"stock":None,"active":True},{"l":"۱٫۴ کیلو","p":410000,"stock":None,"active":True}]},
    {"id":"o2","category":"olive","name":"زیتون سیاه ممتاز شیشه‌ای","description":"زیتون سیاه با طعم ملایم و بافت نرم‌تر برای سالاد و پیتزا.","tag":"","variants":[{"l":"۷۰۰ گرم","p":235000,"stock":None,"active":True},{"l":"۱٫۴ کیلو","p":440000,"stock":None,"active":True}]},
    {"id":"o3","category":"olive","name":"زیتون پرورده‌ی سنتی","description":"زیتون پرورده با چاشنی‌های سنتی؛ همراه نان و پنیر عالی است.","tag":"جدید","variants":[{"l":"۵۰۰ گرم","p":260000,"stock":None,"active":True},{"l":"۱ کیلو","p":480000,"stock":None,"active":True}]},
    {"id":"o4","category":"olive","name":"زیتون بی‌هسته‌ی ویژه","description":"بدون هسته و آماده‌ی استفاده در ساندویچ، سالاد و غذا.","tag":"","variants":[{"l":"۵۰۰ گرم","p":250000,"stock":None,"active":True},{"l":"۱ کیلو","p":470000,"stock":None,"active":True}]},
    {"id":"l1","category":"oil","name":"روغن زیتون فرابکر (قوطی فلزی)","description":"روغن زیتون فرابکر برای سالاد، پخت و مصرف روزانه.","tag":"پرفروش","variants":[{"l":"۱ لیتر","p":790000,"stock":None,"active":True},{"l":"۳ لیتر (حلب)","p":2250000,"stock":None,"active":True}]},
    {"id":"l2","category":"oil","name":"روغن زیتون فرابکر شیشه‌ای","description":"بطری شیشه‌ای زیبا؛ هم برای مصرف، هم برای هدیه.","tag":"هدیه","variants":[{"l":"۲۵۰ میلی‌لیتر","p":260000,"stock":None,"active":True},{"l":"۵۰۰ میلی‌لیتر","p":440000,"stock":None,"active":True}]},
    {"id":"l3","category":"oil","name":"روغن زیتون فرابکر حلب بزرگ (اقتصادی)","description":"برای خانواده‌های پرمصرف و کسب‌وکارهای کوچک.","tag":"","variants":[{"l":"۴ لیتر","p":2950000,"stock":None,"active":True},{"l":"۶ لیتر","p":4300000,"stock":None,"active":True}]},
    {"id":"v1","category":"vacuum","name":"زیتون سبز وکیوم","description":"زیتون سبز در کیسه‌ی وکیوم؛ سبک، نرم و آماده‌ی مصرف.","tag":"پرفروش","variants":[{"l":"۵۰۰ گرم","p":190000,"stock":None,"active":True},{"l":"۱ کیلو","p":360000,"stock":None,"active":True}]},
    {"id":"v2","category":"vacuum","name":"زیتون سیاه وکیوم","description":"زیتون سیاه نرم و خوش‌طعم در بسته‌ی وکیوم.","tag":"","variants":[{"l":"۵۰۰ گرم","p":205000,"stock":None,"active":True},{"l":"۱ کیلو","p":390000,"stock":None,"active":True}]},
    {"id":"v3","category":"vacuum","name":"زیتون وکیوم بی‌هسته","description":"بدون هسته؛ آماده برای سالاد و ساندویچ.","tag":"","variants":[{"l":"۵۰۰ گرم","p":215000,"stock":None,"active":True}]},
    {"id":"v4","category":"vacuum","name":"زیتون وکیوم ادویه‌دار","description":"با فلفل و سیر؛ مخصوص مهمانی و پیش‌غذا.","tag":"جدید","variants":[{"l":"۵۰۰ گرم","p":215000,"stock":None,"active":True}]},
    {"id":"c1","category":"canned","name":"کنسرو زیتون سبز با هسته","description":"قوطی آماده؛ ماندگار و راحت برای آشپزخانه.","tag":"","variants":[{"l":"قوطی ۳۸۰ گرمی","p":120000,"stock":None,"active":True},{"l":"کارتن ۱۲ عددی","p":1350000,"stock":None,"active":True}]},
    {"id":"c2","category":"canned","name":"کنسرو زیتون بی‌هسته","description":"بدون هسته برای ساندویچ، پیتزا و سالاد.","tag":"","variants":[{"l":"قوطی ۳۸۰ گرمی","p":130000,"stock":None,"active":True},{"l":"کارتن ۱۲ عددی","p":1450000,"stock":None,"active":True}]},
    {"id":"c3","category":"canned","name":"کنسرو زیتون حلقه‌ای","description":"برش حلقه‌ای برای پیتزا، ساندویچ و سالاد.","tag":"","variants":[{"l":"قوطی ۳۸۰ گرمی","p":125000,"stock":None,"active":True},{"l":"کارتن ۱۲ عددی","p":1400000,"stock":None,"active":True}]},
    {"id":"c4","category":"canned","name":"کنسرو زیتون سیاه","description":"زیتون سیاه آماده در قوطی؛ مناسب پیتزا و سالاد.","tag":"","variants":[{"l":"قوطی ۳۸۰ گرمی","p":125000,"stock":None,"active":True},{"l":"کارتن ۱۲ عددی","p":1400000,"stock":None,"active":True}]},
]


async def seed_catalog(session: AsyncSession) -> None:
    existing = await session.scalar(select(Product.id).limit(1))
    if existing:
        return
    for item in CATALOG:
        session.add(Product(
            id=item["id"], category=item["category"], name=item["name"],
            description=item["description"], long_description=item.get("long_description", ""),
            tag=item.get("tag", ""), variants=item["variants"], active=True,
        ))
    await session.commit()