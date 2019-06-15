import urllib.request
import urllib.parse
import ssl,random


# 榛子云提供的API
class ZhenziSmsClient(object):

    def __init__(self, apiUrl, appId, appSecret):
        self.apiUrl = apiUrl
        self.appId = appId
        self.appSecret = appSecret

    def send(self, number, message, messageId=''):
        data = {
            'appId': self.appId,
            'appSecret': self.appSecret,
            'message': message,
            'number': number,
            'messageId': messageId
        }

        data = urllib.parse.urlencode(data).encode('utf-8')
        ssl._create_default_https_context = ssl._create_unverified_context
        req = urllib.request.Request(self.apiUrl + '/sms/send.do', data=data)
        res_data = urllib.request.urlopen(req)
        res = res_data.read()
        res = res.decode('utf-8')
        return res

    def balance(self):
        data = {
            'appId': self.appId,
            'appSecret': self.appSecret
        }
        data = urllib.parse.urlencode(data).encode('utf-8')
        ssl._create_default_https_context = ssl._create_unverified_context
        req = urllib.request.Request(self.apiUrl + '/account/balance.do', data=data)
        res_data = urllib.request.urlopen(req)
        res = res_data.read()
        return res

    def findSmsByMessageId(self, messageId):
        data = {
            'appId': self.appId,
            'appSecret': self.appSecret,
            'messageId': messageId
        }
        data = urllib.parse.urlencode(data).encode('utf-8')
        ssl._create_default_https_context = ssl._create_unverified_context
        req = urllib.request.Request(self.apiUrl + '/smslog/findSmsByMessageId.do', data=data)
        res_data = urllib.request.urlopen(req)
        res = res_data.read()
        return res


# 生成验证码并发送
class GetCode:
    def __init__(self):
        # 连接榛子云API
        self.SmsClient=ZhenziSmsClient("https://sms_developer.zhenzikj.com",
                    "101642", "ZGNlMjJiOGQtOTQ5Yy00NjI5LTk4MGItMWZjOGUzZjc2OGU4")

    # 定义生成验证码函数
    def createVerify(self):
        res = []
        source = "0123456789"
        for i in range(6):
            index = random.randint(0, 9)
            res += (source[index])
        res = "".join(res)
        print("验证码："+res)
        return res

    # 发送验证码到手机
    def sendCode(self,phone_num):
        code =self.createVerify()
        data = "您的验证码是" + code + ", 5分钟内有效，请注意保密"
        result = self.SmsClient.send(phone_num, data)
        return code,result



if __name__=="__main__":
    getcode=GetCode()
    getcode.sendCode("17600078490")
