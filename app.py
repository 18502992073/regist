import re
from time import *

import pymysql
from flask import Flask, render_template, request, redirect, make_response, \
    session
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_

pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config[
    'SQLALCHEMY_DATABASE_URI'] = "mysql://root:123456@localhost:3306/forumdb"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = True
# 执行完增删改之后的自动提交
app.config["SQLALCHEMY_COMMIT_ON_TEARDOWN"] = True
app.config["SECRET_KEY"]='zheshiyigeluntandesession123456'

db = SQLAlchemy(app)
manager = Manager(app)

# 创建Migrate对象，并指定关联的app和db
migrate = Migrate(app, db)

# 为manage添加数据库迁移指令,增加一个子命令-db(自定义)具体操作由MigrateCommand来提供
manager.add_command('db', MigrateCommand)


# 创建用户表
class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    uname = db.Column(db.String(32), unique=True, nullable=False)
    pwd = db.Column(db.String(32), nullable=False)
    phone = db.Column(db.String(11), nullable=False, unique=True)
    img = db.Column(db.String(64), nullable=True)
    status = db.Column(db.Integer, default=0)
    blogs = db.relationship("Blog", backref="user", lazy="dynamic")
    comments = db.relationship("Comment", backref="user", lazy="dynamic")


# 创建博客表
class Blog(db.Model):
    __tablename__ = "blog"
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, nullable=False)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.String(20000), nullable=False)
    img = db.Column(db.String(64), nullable=True)
    tags = db.Column(db.String(60), nullable=True)
    # comment_num = db.Column(db.Integer, default=0)
    great_num = db.Column(db.Integer, default=0)
    status = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    comments = db.relationship("Comment", backref="blog", lazy="dynamic")


# 创建评论表
class Comment(db.Model):
    __tablename__ = "comment"
    id = db.Column(db.Integer, primary_key=True)
    # user_id = db.Column(db.Integer, nullable=False)
    text = db.Column(db.String(256), nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Boolean, default=True)
    blog_id = db.Column(db.Integer, db.ForeignKey("blog.id"))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


"""cookie的加密设置"""
# response.set_signed_cookie('email',email,salt="salt")
"""cookie的获取解密"""


# responset.get_signed_cookie('email',email,salt="salt")

# 用户注册
@app.route("/regist", methods=["POST", "GET"])
def do_regist():
    # 设定默认响应对象为主页
    resp = make_response(redirect("/index"))
    if "uname" in session:
        return resp
    # 判断请求头headers中是否含有Referer
    if "Referer" in request.headers:
        # 设定响应对象为页面源
        refer = request.headers["Referer"]
        # 找到页面源的路由地址
        addr = re.split("5000", refer)[-1]
        # 如果页面来源不是重置密码页面
        if addr not in ["/reset_pwd", "/login", "/regist"]:
            # 把响应对象更新为页面源地址
            resp = make_response(redirect("%s" % addr))
    # 用户请求注册页面
    if request.method == "GET":
        # 返回注册页面
        return render_template("regist.html")
    # 用户请求提交注册信息
    else:
        # 获取用户提交的信息
        name = request.form["name"]
        phone = request.form["phone"]
        # 在数据库里查找用户对象
        res1 = User.query.filter_by(uname=name).first()
        res2 = User.query.filter_by(phone=phone).first()
        # 如果用户的两次输入密码相同,并且根据用户名和手机号在数据库里未查找到用户对象
        if request.form["rpwd"] == request.form[
            "pwd"] and not res1 and not res2:
            # 用户注册成功,加用户信息进入数据库
            try:
                user = User()
                user.uname = name
                user.pwd = request.form["pwd"]
                user.phone = phone
                db.session.add(user)
                session["uname"] = name
                return resp
            except Exception as e:
                return "<script>alert(%s);location.href='/regist'</script>" % e
        elif res1:
            return "<script>alert('注册失败,用户名重复');location.href='/regist'</script>"
        else:
            return "<script>alert('注册失败,手机号重复');location.href='/regist'</script>"


# 用户登录
@app.route("/login", methods=["GET", "POST"])
def do_log():
    # 定义响应对象,默认响应对象为主页
    resp = redirect("/index")
    # 判断是否是从别的页面跳到登陆页面上的
    if "Referer" in request.headers:
        # 设定响应对象为页面源
        refer = request.headers["Referer"]
        addr = re.split("5000", refer)[-1]
        # 如果页面来源不是重置密码页面
        if addr not in ["/reset_pwd", "/login", "/regist"]:
            # 把响应对象更新为页面源地址
            resp = make_response(redirect("%s" % addr))
    # 用户请求获取页面信息
    if request.method == "GET":
        # 如果session里存在数据,那么说明当前浏览器中已有用户处于登录状态
        if "uname" in session:
            # 返回响应对象
            return resp
        # 如果session里不存在数据,则判断cookies里是否有数据
        else:
            # 如果cookies里有数据
            if "uname" in request.cookies:
                # 获取cookie数据
                uname = request.cookies.get("uname")
                id = int(request.cookies.get("id").split(".")[-2])
                phone = request.cookies.get("id").split(".")[-1]
                # 数据库里查询用户对象
                user = User.query.filter_by(uname=uname).first()
                # 判断用户名和id是否匹配
                if user and user.id == id and user.phone[-4:] == phone:
                    # 如果匹配则把用户名存入session中
                    session["uname"] = uname
                    # 返回响应对象
                    return resp
                else:
                    # 如果不匹配则删除cookie里的错误数据
                    resp.delete_cookie("uname")
                    resp.delete_cookie("id")
            # 如果cookie里没有数据,或者cookie信息错误
            return render_template("login.html", params=False)
    # 用户提交登陆信息
    else:
        # 获取用户提交数据
        uname = request.form["uname"]
        pwd = request.form["upwd"]
        # 根据用户名查找数据库数据
        user = db.session.query(User).filter(
            or_(User.uname == uname, User.phone == uname)).first()
        print(user)
        # 判断对象是否存在,密码是否正确
        if user and user.pwd == pwd:
            # 保存uname到session中
            session["uname"] = user.uname
            # 判断用户是否选择了记录密码
            if "rmb_pwd" in request.form:
                # print("user.name:", uname)
                # print("user.id:", user.id)
                # 如果选择记录密码,则在cookies中存下uname和id的值
                resp.set_cookie("uname", uname, max_age=3 * 24 * 60 * 60)
                # id定义为forum.id.phone[-4:]作为用户的记住密码印记
                resp.set_cookie("id",
                                "forum." + str(user.id) + "." + user.phone[-4:],
                                max_age=3 * 24 * 60 * 60)
            # 不管有没有选择记录密码,都返回响应对象
            return resp
        else:
            return render_template("login.html", params=True)


# 重置密码
@app.route("/reset_pwd", methods=["GET", "POST"])
def do_reset():
    # 用户获取重置密码页面信息
    if request.method == "GET":
        # 如果已有用户处于登录状态,则返回主页
        if "uname" in session:
            return render_template("view.html")
        # 如果带有"reset_result"参数则说明上次的重置密码请求出错
        if "reset_result" in request.args:
            print("重试")
            # 如果有cookie中有phnoe字段,那么就是验证码错误导致的失败
            if "phone" in request.cookies:
                # 那么提取phone作为参数传递给页面,作为手机号输入框的初始值
                code_phone = request.cookies["phone"]
                code_result = True
                phone_result = False
                print("验证码错误:", code_result, phone_result)
                print()
            # 如果cookie中没有phnoe字段
            else:
                # 那么就是手机号错误导致的失败,作为参数传递页面,显示'手机号码不正确，或尚未注册'
                phone_result = True
                code_result = False
                print("手机号错误:", code_result, phone_result)
            return render_template("reset_password.html", params=locals())
        # 如果带有"reset_result"参数返回初始页面
        else:
            phone_result = False
            return render_template("reset_password.html", params=locals())
    # 用户提交登陆信息
    else:
        # 接收用户提交的信息
        phone = request.form["phone"]
        pwd = request.form["reset_pwd"]
        code = request.form["code"]
        print(code)
        # 需要对验证码与后台进行判定
        """用AJAX技术实现发送验证码"""
        """----------------待实现-------------------"""
        """如果验证码错误,则把手机号和存在cookie里作为临时数据,以便下次提交使用"""
        get_code = str(1234)
        # 根据用户的手机号在数据库中查找用户对象
        user = User.query.filter_by(phone=phone).first()
        # 如果用户的验证码并且数据库中存在此用户对象
        if code == get_code and user:
            # 在数据库中更新密码
            user.pwd = pwd
            # 更新后的用户对象加入数据库中
            db.session.add(user)
            # 提示用户重置密码成功,返回登录页面
            # 删除之前可能存下来的cookie
            if phone in request.cookies:
                resp = make_response(
                    "<script>alert('验证码错误,请重新确认');location.href='/reset_pwd?reset_result=False'</script>")
                resp.delete_cookie("phone")
            return "<script>alert('重置密码成功,请重新登录');location.href='/login'</script>"
        # 如果验证码不正确
        elif code != get_code:
            # 设置响应对象
            resp = make_response(
                "<script>alert('验证码错误,请重新确认');location.href='/reset_pwd?reset_result=False'</script>")
            # 设置phone作为临时cookie以便后续作为输入框初始值使用
            resp.set_cookie("phone", phone, max_age=60)
            # 如果用户不存在则设置cookie为空
            if not user:
                resp.set_cookie("phone", "", max_age=60)
            # 返回响应对象
            return resp
        # 手机号不正确
        else:
            return "<script>alert('手机号码错误或未注册');location.href='/reset_pwd?reset_result=False'</script>"


# 请求主页
@app.route("/")
@app.route("/index")
def index():
    blogs = Blog.query.filter(Blog.status == True).all()
    # 如果当前浏览器有用户是已登录状态
    if "uname" in session:
        # 获取session中的用户名
        session_name = session["uname"]
        # 在数据库里查号用户对象
        user = User.query.filter_by(uname=session_name).first()
        # 返回用户已登录状态的主页
        return render_template("index.html", params=locals())
    # 如果当前网页中存在cookies,获取cookie得知
    if "uname" in request.cookies:
        cookie_name = request.cookies["uname"]
        cookie_id = int(request.cookies["id"].split(".")[-2])
        cookie_phone = request.cookies["id"].split(".")[-1]
        # 根据cookie中的用户名查找数据库用户对象
        user = User.query.filter_by(uname=cookie_name).first()
        # 如果数据库中用户存在并且id和phone的信息正确
        if user and user.id == cookie_id and user.phone[-4:] == cookie_phone:
            # 返回用户已登录状态的页面
            return render_template("index.html", params=locals())
        else:
            return render_template("index.html", params=locals())
    else:
        # 否则返回未登录页面
        return render_template("index.html", params=locals())


# 查看博客
@app.route("/blog", methods=['GET', 'POST'])
def get_blog():
    # 获取帖子标题
    blog_title = request.args['blog_title']
    # 根据帖子标题查找相应的对象
    blog = Blog.query_by(title=blog_title).first()
    # 提取页面中要是显示的楼主信息
    uname = blog.user.uname
    img = blog.user.img
    if request.method == 'POST':
        comment = Comment()
        comment.user_id = uname.id
        comment.text = request.form['comment']
        comment.time = strftime("%Y-%m-%d %H:%M:%S", localtime())
        comment.blog_id = blog.id
    # 提取页面中要是显示的帖子信息
    blog_num = User.query_by(uname=uname).all().length()
    comments = Comment.query.filter(Comment.blog_id == blog.id,
                                    Comment.status == True).all()
    comment_num = comments.length()
    time = blog.time
    tags = blog.tags
    content = blog.content
    return render_template("blog.html", params=locals())


# 编写微博
@app.route("/write_blog", methods=['GET', 'POST'])
def write_blog():
    if request.method == 'GET':
        # 判断用户是否登录,是则提取页面信息,否跳转登录
        if 'uname' in session:
            uname = session['uname']
            user = User.query.filter_by(uname=uname).first()
            img = user.img
            blogs = user.blogs
            comments = user.comments
            return render_template("write.html", params=locals())
        else:
            return redirect('/login')
    else:
        uname = session['uname']
        user = User.query.filter_by(uname=uname).first()
        blog = Blog()
        blog.title = request.form['title']
        blog.tags = request.form['type']
        blog.content = request.form['content']
        blog.user_id = user.id
        blog.time = strftime("%Y-%m-%d %H:%M:%S", localtime())
        print(blog.title)
        try:
            db.session.add(blog)
            return "<script>alert('发表成功');location.href='/manage_blog'</script>"
        except Exception:
            return "<script>alert('发表失败')</script>"


# 博客管理
@app.route("/manage_blog", methods=['GET', 'POST'])
def manager_blog():
    return render_template("blog_manage.html")


# 关于论坛
@app.route('/about')
def about():
    return render_template('about.html')


# 用户协议
@app.route('/protocol')
def protocol():
    return render_template("protocol.html")


if __name__ == '__main__':
    # app.run()
    manager.run()
