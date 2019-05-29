from exts import db


# 用户数据表
class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    img = db.Column(db.String(64), unique=True, nullable=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    pwd = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(11), unique=True, nullable=False)
    static = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Integer)
