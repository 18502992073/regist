import json
import os
import re
from time import *

import pymysql
from flask import Flask, render_template, request, redirect, make_response, \
    session
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_

from vertify_code import GetCode

pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config[
    'SQLALCHEMY_DATABASE_URI'] = "mysql://root:123456@localhost:3306/forumdb"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = True
# 执行完增删改之后的自动提交
app.config["SQLALCHEMY_COMMIT_ON_TEARDOWN"] = True
app.config["SECRET_KEY"] = 'zheshiyigeluntandesession123456'

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
    email = db.Column(db.String(64), unique=True)
    img = db.Column(db.String(1024), nullable=True)
    status = db.Column(db.Integer, default=1)
    truename = db.Column(db.String(16), nullable=True, default="")
    sex = db.Column(db.String(8), nullable=True, default='男')
    birthday = db.Column(db.Date, nullable=True)
    addr = db.Column(db.String(64), nullable=True, default="")
    profession = db.Column(db.String(64), nullable=True, default="")
    job = db.Column(db.String(32), nullable=True, default="")
    intro = db.Column(db.String(200), nullable=True, default="")
    blogs = db.relationship("Blog", backref="user", lazy="dynamic")
    comments = db.relationship("Comment", backref="user", lazy="dynamic")

    def to_dic(self):
        dic = {
            "id": self.id,
            "uname": self.uname,
            "phone": self.phone,
            "email": self.email,
            "img": self.img,
            "truename": self.truename,
            "sex": self.sex,
            "birthday": str(self.birthday),
            "addr": self.addr,
            "profession": self.profession,
            "job": self.job,
            "intro": self.intro,
        }
        return dic


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

    def to_dic(self):
        count = 0
        for c in self.comments:
            count += 1
        dic = {
            "id": self.id,
            "time": str(self.time),
            "title": self.title,
            "content": self.content,
            "img": self.img,
            "tags": self.tags,
            "great_num": self.great_num,
            "status": self.status,
            "user_id": self.user_id,
            "comments_num": count,
        }
        return dic


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


class UserRelatiuonship(db.Model):
    __tablename__ = "relationship"
    id = db.Column(db.Integer, primary_key=True)
    focus_id = db.Column(db.Integer, nullable=False)
    focused_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Boolean, default=1)


# 用户注册
@app.route("/regist", methods=["POST", "GET"])
def do_regist():
    # 设定默认响应对象为主页
    resp = make_response(redirect("/index"))
    response_add = "/index"
    if "uname" in session:
        return resp
    # 判断请求头headers中是否含有Referer
    if "Referer" in request.headers:
        # 设定响应对象为页面源
        refer = request.headers["Referer"]
        # 找到页面源的路由地址
        addr = re.split("5000", refer)[-1]
        response_add = addr
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
        print("验证数据")
        # 获取用户提交的信息
        name = request.form["name"]
        phone = request.form["phone"]
        # 在数据库里查找用户对象
        res1 = User.query.filter_by(uname=name).first()
        res2 = User.query.filter_by(phone=phone).first()
        # 如果用户的两次输入密码相同,并且根据用户名和手机号在数据库里未查找到用户对象
        if request.form["rpwd"] == request.form["pwd"] and not res1 and not res2:
            # 用户注册成功,加用户信息进入数据库
            user = User()
            user.uname = name
            user.pwd = request.form["pwd"]
            user.phone = phone
            db.session.add(user)
            session["uname"] = name
            dic = {"status": 1, "url": response_add}
            return json.dumps(dic)
        elif res1:
            return "<script>alert('注册失败,用户名重复');location.href='/regist'</script>"
        else:
            return "<script>alert('注册失败,手机号重复');location.href='/regist'</script>"


# 用ajax实现注册页面效果,获取用户输入的用户名判断
@app.route("/01-regist")
def registHelper():
    # 获取用户名
    uname = request.args["uname"]
    # 数据库里查找用户
    user_by_name = User.query.filter_by(uname=uname).first()
    user_by_phone = User.query.filter_by(phone=uname).first()
    print(user_by_phone, user_by_name)
    # 如果用户名已存在
    if user_by_name or user_by_phone:
        # 返回用户名重复错误
        print("用户存在")
        dic = {"status": 0, "text": "用户名已存在"}
        return json.dumps(dic)
    # 如果用户名不存在
    else:
        # 返回可以注册状态
        dic = {"status": 1, "text": "ok"}
        return json.dumps(dic)


# 注册页面用ajax获取手机号码判断
@app.route("/01-regist_phone")
def getphone():
    # 获取手机号码
    phone = request.args["phone"]
    # 在数据库里查找用户
    user = User.query.filter_by(phone=phone).first()
    print(user)
    if user:
        dic = {"status": "0", "code": "此手机号码已注册"}
    else:
        dic = {"code": "ok", "status": "1"}
    return json.dumps(dic)


# ajax实现发送验证码
@app.route("/01-regist_code")
def getCode():
    # 获取手机号码
    phone = request.args["phone"]
    getcode = GetCode()
    # 发送验证码
    code_num, result = getcode.sendCode(phone)
    print("result", result, type(result))
    if result[8] == "0":
        dic = {"code": code_num, "status": 1}
    else:
        dic = {"status": 0, "code": "发送验证码错误"}
    print("dic", dic)
    return json.dumps(dic)


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
        status = user.status
        # 判断用户状态（0禁止登录，1可以正常登录，2已登录）
        if status == 1:
            # 判断对象是否存在,密码是否正确
            if user and user.pwd == pwd:
                # 保存uname到session中
                session["uname"] = user.uname
                # 设置用户状态为2,防止一个用户多次登录
                uid = str(user.id)
                resp.set_cookie('uid', uid, max_age=24*60*60*3)
                user.status = 2
                try:
                    db.session.add(user)
                except Exception:
                    return "<script>alert('登录异常请联系管理员');location.href='/login'</script>"
                # 判断用户是否选择了记录密码
                if "rmb_pwd" in request.form:
                    # 如果选择记录密码,则在cookies中存下uname和id的值
                    resp.set_cookie("uname", uname, max_age=3 * 24 * 60 * 60)
                    # id定义位forum.id.phone[-4:]作为用户的记住密码印记
                    resp.set_cookie("id", "forum." + str(user.id) + "." + user.phone[-4:],
                                    max_age=3 * 24 * 60 * 60)
                # 不管有没有选择记录密码,都返回响应对象
                return resp
            else:
                return render_template("login.html", params=True)
        elif status == 0:
            return "<script>alert('帐号异常请联系管理员');location.href='/login'</script>"
        else:
            return "<script>alert('帐号已登录');location.href='/login'</script>"


# 用ajax实现登录页面效果
@app.route("/02-login")
def loginHelper():
    # 获取异步访问传入的用户名
    uname = request.args["uname"]
    # 根据用户名在数据库里查找用户
    user_by_name = User.query.filter_by(uname=uname).first()
    user_by_phone = User.query.filter_by(phone=uname).first()
    # 如果用户名存在
    if user_by_name or user_by_phone:
        # 返回status=1
        dic = {"status": 1, "text": "账号存在"}
    # 如果用户名不存在
    else:
        # 返回status=0
        dic = {"status": 0, "text": "账号不存在"}
    # 返回数据
    return json.dumps(dic)


# 重置密码
@app.route("/reset_pwd", methods=["GET", "POST"])
def do_reset():
    # 用户获取重置密码页面信息
    if request.method == "GET":
        # 如果已有用户处于登录状态,则返回主页
        if "uname" in session:
            return render_template("index.html")
        # 如果带有"reset_result"参数则说明上次的重置密码请求出错
        if "reset_result" in request.args:
            # 如果有cookie中有phnoe字段,那么就是验证码错误导致的失败
            if "phone" in request.cookies:
                # 那么提取phone作为参数传递给页面,作为手机号输入框的初始值
                code_phone = request.cookies["phone"]
                phone_result = False
                print("验证码错误:", phone_result)
            # 如果cookie中没有phnoe字段
            else:
                # 那么就是手机号错误导致的失败,作为参数传递页面,显示'手机号码不正确，或尚未注册'
                phone_result = True
                print("手机号错误:", phone_result)
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
        # 根据用户的手机号在数据库中查找用户对象
        user = User.query.filter_by(phone=phone).first()
        # 如果用户的验证码并且数据库中存在此用户对象
        if user:
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
        else:
            return "<script>alert('手机号码错误或未注册');location.href='/reset_pwd?reset_result=False'</script>"


# 重置密码动态路由
@app.route("/03-reset")
def resetHelper():
    phone = request.args["phone"]
    user = User.query.filter_by(phone=phone).first()
    if user:
        dic = {"status": 1, "text": "手机号存在"}
    else:
        dic = {"status": 0, "text": "手机号不存在"}
    return json.dumps(dic)


@app.route('/logout')
def logout():
    resp = make_response(redirect('/'))
    if 'uname' in request.cookies:
        resp.delete_cookie("uname", path='/', domain='176.234.2.27')
        resp.delete_cookie("id", path='/', domain='176.234.2.27')
    if 'uname' in session:
        uname = session.get('uname')
        user = User.query.filter_by(uname=uname).first()
        if user.status == 2:
            user.status = 1
            try:
                db.session.add(user)
            except Exception:
                return "<script>alert('操作异常请联系管理员')</script>"
        session.pop("uname")
    return resp


@app.route("/close")
def close_window():
    if "uname" not in session:
        uid = request.cookies.get("uid")
        user = User.query.filter_by(id=uid).first()
        if user.status == 2:
            print("*******************************")
            user.status = 1
            db.session.add(user)
    return "页面关闭"


# 请求主页
@app.route("/")
@app.route("/index")
def index():
    blogs = Blog.query.filter(Blog.status == True).all()
    blogs.reverse()
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
        # 否则返回首页
        return render_template("index.html", params=locals())


@app.route("/index-server")
def index_server():
    tags = request.args['tags']
    if tags == "推荐":
        blogs = Blog.query.filter(Blog.status == True).all()
    else:
        blogs = Blog.query.filter(Blog.tags == tags, Blog.status == True).all()
    blist = []
    for blog in blogs:
        user = User.query.filter_by(id=blog.user_id).first()
        blog_dic = blog.to_dic()
        blog_dic['uname'] = user.uname
        blog_dic['content'] = blog.content[0:100] + '. . .'
        blist.append(blog_dic)
    return json.dumps(blist)


# 查看博客
@app.route("/blog")
def get_blog():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        # 获取帖子标题
        id = request.args['blog_id']
        # 根据帖子标题查找相应的对象
        blog = Blog.query.filter(Blog.id == id, Blog.status == True).first()
        content = re.findall(r'.*', blog.content)
        # 提取页面中要是显示的楼主信息
        comments = Comment.query.filter_by(blog_id=blog.id, status=True)
        print(comments)
        user_list = []
        for comment in comments:
            comm_user = User.query.filter_by(id=comment.user_id).first()
            user_list.append(comm_user)
        user = User.query.filter_by(id=blog.user_id).first()
        myname = session['uname']
        my = User.query.filter_by(uname=myname).first()
        is_focus = UserRelatiuonship.query.filter_by(focus_id=my.id,
                                                     focused_id=user.id,
                                                     status=True).first()
        print("guanzhu", is_focus)
        return render_template("blog.html", params=locals())


@app.route("/comment", methods=['POST'])
def comment():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        comment = Comment()
        comment.text = request.form['comment']
        comment.time = strftime("%Y-%m-%d %H:%M:%S", localtime())
        comment.blog_id = request.form['blog-id']
        comment.user_id = request.form['uid']
        try:
            db.session.add(comment)
            return redirect('/blog?blog_id=' + request.form['blog-id'])
        except Exception:
            return "<script>alert('评论失败')</script>"


# 编写微博
@app.route("/write_blog", methods=['GET', 'POST'])
def write_blog():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        # get方法获取页面数据，post方法提交发表内容
        if request.method == 'GET':
            # 判断用户是否登录,是则提取页面信息,否跳转登录
            if 'uname' in session:
                uname = session['uname']
                user = User.query.filter_by(uname=uname).first()
                fans = UserRelatiuonship.query.filter_by(focused_id=user.id,
                                                         status=1).all()
                blogs = Blog.query.filter_by(user_id=user.id, status=True).all()
                print(blogs)
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
            print(request.form['content'])
            blog.user_id = user.id
            blog.time = strftime("%Y-%m-%d %H:%M:%S", localtime())
            try:
                db.session.add(blog)
                return "<script>alert('发表成功');window.location.href='/manage_blog'</script>"
            except Exception:
                return "<script>alert('发表失败')</script>"


# 博客管理
@app.route("/manage_blog")
def manager_blog():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        uname = session['uname']
        user = User.query.filter_by(uname=uname).first()
        blogs = Blog.query.filter(Blog.user_id == user.id, Blog.status == True).all()
    return render_template("blog_manage.html", params=locals())


@app.route('/blog_manage_server1')
def blog_manage_server1():
    uname = session['uname']
    user = User.query.filter_by(uname=uname).first()
    blogs = Blog.query.filter(Blog.user_id == user.id, Blog.status == True).all()
    blist = []
    for blog in blogs:
        comments = blog.comments
        comment_num = 0
        for comment in comments:
            comment_num += 1
        blog_dic = blog.to_dic()
        blog_dic['comment_num'] = comment_num
        blog_dic['content'] = blog.content[0:120] + '. . .'
        blist.append(blog_dic)
    return json.dumps(blist)


@app.route('/blog_manage_delete')
def delete_blog():
    title = request.args['title']
    uname = session['uname']
    user = User.query.filter_by(uname=uname).first()
    blog = Blog.query.filter(Blog.title == title, Blog.user_id == user.id).first()
    comments = blog.comments
    for comment in comments:
        comment.status = False
        db.session.add(comment)
    try:
        blog.status = False
        db.session.add(blog)
        return "1"
    except Exception:
        return "0"


@app.route('/center')
def center():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        uname = session['uname']
        user = User.query.filter_by(uname=uname).first()
        user_list = user.to_dic()
        id = user.id
        focus = len(UserRelatiuonship.query.filter_by(focus_id=id, status=1).all())
        fans = len(UserRelatiuonship.query.filter_by(focused_id=id, status=1).all())
        return render_template('center.html', params=locals())


@app.route('/center-server', methods=['GET', 'POST'])
def center_server():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        uname = session['uname']
        user = User.query.filter_by(uname=uname).first()
        if request.method == 'GET':
            user_list = user.to_dic()
            for key in user_list:
                if user_list[key] in ['null', 'NULL', 'None', None]:
                    user_list[key] = ""
            return json.dumps(user_list)
        else:
            user.truename = request.form.get('truename', "")
            user.sex = request.form.get('sex', "")
            user.email = request.form.get('email', "")
            user.birthday = request.form.get('birthday', "")
            user.addr = request.form.get('addr', "")
            user.profession = request.form.get('profession', "")
            user.job = request.form.get('job', "")
            user.intro = request.form.get('intro', "")
            try:
                db.session.add(user)
                return "<script>alert('修改成功！');location.href='/center'</script>"
            except Exception:
                return "<script>alert('修改失败！');location.href='/center'</script>"


@app.route('/update-pwd', methods=['GET', 'POST'])
def update_pwd():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        uname = session['uname']
        user = User.query.filter_by(uname=uname).first()
        if request.method == 'GET':
            upwd = user.pwd
            data = {'upwd': upwd}
            print(data)
            return json.dumps(data)
        else:
            user.pwd = request.form.get('newpwd')
            try:
                db.session.add(user)
                return "<script>alert('修改成功！');location.href='/center'</script>"
            except Exception:
                return "<script>alert('修改失败！');location.href='/center'</script>"


@app.route('/update-email', methods=['GET', 'POST'])
def update_email():
    if 'uname' not in session:
        return "<script>alert('请先登录');location.href='/login'</script>"
    else:
        uname = session['uname']
        user = User.query.filter_by(uname=uname).first()
        if request.method == 'GET':
            user_dic = user.to_dic()
            return json.dumps(user_dic)
        else:
            user.email = request.form.get('newemail')
            try:
                db.session.add(user)
                return "<script>alert('修改成功！');location.href='/center'</script>"
            except Exception:
                return "<script>alert('修改失败！');location.href='/center'</script>"


@app.route("/modify_phone")
def mofify_phone_views():
    ophone = request.args.get("ophone")
    nphone = request.args.get("nphone")
    pwd = request.args.get("pwd")
    uname = request.args.get("uname")
    input_code = request.args.get("input_code")
    code = request.args.get("code")
    user = User.query.filter_by(uname=uname).first()
    # 判断当前用户输入旧手机和密码是否正确
    print(user.phone, ophone)
    print()
    if user.phone == ophone and user.pwd == pwd:
        # 判断用户提供的新手机和验证码是否正确
        print(1)
        if len(nphone) == 11 and int(nphone) and int(code) == int(input_code):
            user.phone = nphone
            print(2)
            try:
                db.session.add(user)
                dic = {"status": 1, "text": "修改成功"}
            except Exception as e:
                dic = {"status": 0, "text": "修改成功"}
                print(e)
        else:
            dic = {"status": 0, "text": "用户提交数据错误"}
    else:
        dic = {"status": 0, "text": "用户提供数据错误"}
    return json.dumps(dic)


@app.route("/modify_img", methods=["POST"])
def modify_img():
    # 获取用户名
    uname = session["uname"]
    user = User.query.filter_by(uname=uname).first()
    # 获取上传图片
    file = request.files["user_img"]
    # 获取时间戳
    upload_time = strftime("%Y-%m-%d %H:%M:%S", localtime())
    # 获取文件后缀
    ext = file.filename.split(".")[-1]
    # 获取上传文件名
    real_filename = "".join(file.filename.split(".")[:-1])
    # 判断文件格式
    if ext.lower() in ["jpg", "jpeg", "png", "bmp"]:
        # 生成自定义文件名
        filename = "%s&%s&%s.%s" % (uname, upload_time, real_filename, ext)
        # 确定相对目录
        rel_dir = "static/upload_files/"
        # 查找当前文件所在的绝对目录,去掉最后一个目录,表示app的绝对路径
        base_dir = os.path.dirname(__file__)
        # 连接路径确定文件存储路径
        path = os.path.join(base_dir, rel_dir, filename)
        file.save(path)
        # 生成文件的引用路径
        use_addr = path.split("/forum")[-1]
        user.img = ".." + use_addr
        db.session.add(user)
        return redirect("/center")
    else:
        return "<script>alert('图片格式不支持')</script>"


@app.route("/focus", methods=["POST"])
def add_userelationship():
    # 获取被关注人的id,由ajax传递的参数
    focused_id = request.form.get("focused_id")
    print(focused_id)
    # 判断当前用户是否是已登录状态
    if "uname" in session:
        # 从session里获取用户名
        focus_name = session["uname"]
        # 查找数据库里的用户对象,获取id
        focus_user = User.query.filter_by(uname=focus_name).first()
        # 判断是否是取消关注
        action = int(request.form.get("action"))
        if action == 1:
            # 判断是否有关系链存在
            rel = UserRelatiuonship.query.filter_by(focus_id=focus_user.id,
                                                    focused_id=focused_id).first()
            if rel:
                # 如果存在关系链,则修改关系状态
                rel.status = True
            else:
                # 如果不存在则创建关系对象,并添加属性值
                rel = UserRelatiuonship()
                rel.focus_id = focus_user.id
                rel.focused_id = focused_id
        else:
            rel = UserRelatiuonship.query.filter_by(focus_id=focus_user.id,
                                                    focused_id=focused_id).first()
            rel.status = False
        # 保存数据库判断结果,返回结果
        try:
            db.session.add(rel)
        except Exception as e:
            print(e)
            dic = {"status": 0, "text": "关注失败"}
        else:
            dic = {"status": 1, "text": "添加关注成功"}
        return json.dumps(dic)
    else:
        return "<script>alert('您还未登陆,请登录后操作')"


@app.route('/search')
def search():
    keywords = request.args['keywords']
    blogs = Blog.query.filter(or_(Blog.title.like('%' + keywords + '%'),
                                  Blog.content.like('%' + keywords + '%'))).all()
    blist = []
    for blog in blogs:
        user = User.query.filter_by(id=blog.user_id).first()
        blog_dic = blog.to_dic()
        blog_dic['uname'] = user.uname
        blog_dic['content'] = blog.content[0:100] + '. . .'
        blist.append(blog_dic)
    return json.dumps(blist)


# 关于论坛
@app.route('/about')
def about():
    return render_template('about.html')


# 用户协议
@app.route('/protocol')
def protocol():
    return render_template("protocol.html")


if __name__ == '__main__':
    manager.run()
