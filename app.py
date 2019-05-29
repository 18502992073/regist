from flask import Flask, render_template, request, redirect, flash
from flask_script import Manager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, MigrateCommand
import pymysql
pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql://root:123456@localhost:3306/forumDB"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = True
# 执行完增删改之后的自动提交
app.config["SQLALCHEMY_COMMIT_ON_TEARDOWN"] = True

db = SQLAlchemy(app)
manager = Manager(app)


# 创建Migrate对象，并指定关联的app和db
migrate = Migrate(app, db)

# 为manage添加数据库迁移指令,增加一个子命令-db(自定义)具体操作由MigrateCommand来提供
manager.add_command('db', MigrateCommand)


# 用户数据表
class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    img = db.Column(db.String(64), unique=True, nullable=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    pwd = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(11), unique=True, nullable=False)
    email = db.Column(db.String(20), unique=True, nullable=True)
    static = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Integer, default=True)


@app.route('/')
@app.route("/index")
def index():
    return render_template('index.html')


@app.route('/regist', methods=["GET", "POST"])
def regist():
    if request.method == "GET":
        return render_template("regist.html")
    else:
        try:
            user = Users()
            user.name = request.form['name']
            user.pwd = request.form['pwd']
            user.phone = request.form['phone']
            db.session.add(user)
            print(type(request.form['phone']))
        except:
            db.session.rollback()
            # flash("用户名或手机号已存在")
            return redirect('/regist')
        else:
            # flash("注册成功")
            return "<h1>注册成功</h1>"
            # return redirect('/index')


@app.route('/blog_manage', methods=['GET', 'POST'])
def blog_manage():
    return render_template("blog_manage.html")


@app.route('/write')
def write():
    return render_template("write.html")


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/protocol')
def protocol():
    return render_template("protocol.html")


if __name__ == '__main__':
    # app.run()
    manager.run()
