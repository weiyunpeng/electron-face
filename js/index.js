//是否是开发模式，上线后，要改为 false
var IS_DEV = false;
if(IS_DEV){
    //本地调试模式
    SERVER_URL = "http://localhost:9998/xxx/xxx/detectface/face_detect/detectface";
}else{
    //不是本地调试模式
    SERVER_URL = "http://10.97.204.180:3333/api/identify/identify/dyw/584e3b7155bd1267f4c64295";
}
document.addEventListener('DOMContentLoaded', function() {
    //初始化页面
    Page.initPage();
});
var Page = {
    /**
     * 视频拍照计时器
     */
    canvasInt:null,
    /**
     * 请求人脸接口
     */
    qryFace:null,
    /**
     * 获取视频对象
     */
    video:null,
    /**
     * 初始化页面事件
     */
    initPage: function () {
        var self = this;
        self.test = 0;//为识别到人脸测试
        self.errorTest = 0;//请求异常处理
        self.ajaxtest = 0;//接口异常处理
        self.getMedia();//使用canvas画图
    },
    /**
     * ajax请求
     */
    ajax: function (ajaxOption) {
        var self = this;
        $.ajax({
            url: ajaxOption.option.url,
            type: ajaxOption.option.type,
            timeout: 6000,
            data: ajaxOption.option.data,
            success: function (data) {
                if(ajaxOption.success){
                    if ( typeof (data) == "string") {
                        //如果是字符串的话，把他变为对象
                        try {
                            data = JSON.parse(data);
                            ajaxOption.success(data);
                        } catch(e) {
                            console.log('返回数据不是json格式'+ e.stack);
                        }
                    }else{
                        //json对象
                        ajaxOption.success(data);
                    }
                }
            },
            error: function (e) {
                console.log("ajax请求报错"+e.stack);
                self.qryAjaxFail();
            }
        });
    },
    /**
     *解析模板输出html
     */
    template : function(tpl_html, data) {
        var tmp = _.template(tpl_html);
        var html = tmp(data);
        return html;
    },
    /**
     * 请求ajax失败执行以下操作
     */
    qryAjaxFail:function(){
      var self = this;
        self.ajaxtest++;
        if(self.ajaxtest>=2){
            // 异常时间过久，直接识别成功
            console.log("这个人不在库中，直接识别成功");
            clearInterval(self.canvasInt);

            $('.tips_success').removeClass('hide');
            setTimeout(function () {
                self.clearRestart();
            }, 1200);
        }else{
            //请求接口
            console.log("这个人很有可能在库中，让它再调摄像头一次");
            clearInterval(self.canvasInt);
            self.getCanvas(self.video);
        }
    },
    /**
     *拍照成功
     */
    qryDetectFace: function (base64Str) {
        var self = this;
        if(IS_DEV==true){
            //调试模式
            var base64Str = "asdfasdfasdf12312";
        }
        var data = {
            image: base64Str
        };
        self.ajax({
            option: {
                type: 'post',
                url: SERVER_URL,
                data: data
            },
            success: function (ajaxdata) {
                var code = ajaxdata.code;
                console.log("code="+code+" "+"ajaxdata="+JSON.stringify(ajaxdata));
                //ajaxdata={"code":200,"message":"已经签到","data":{"perInfo":{"_id":"584e6284613bd93ad0006128","name":"卫云鹏","phone":null,"IDCard":"","job":"","address":"","home":"","tag":"","group_ids":"dyw","image":"http://10.97.204.119:3333/admin/static/files/upload_731cfb98694e288e1776650ba11abb06.jpg","created":"2016-12-12T08:40:36.191Z","updated":null,"deleted":null},"list":[{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_731cfb98694e288e1776650ba11abb06.jpg"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_f94bc2e788f9a1d2e05f8e7ecae91135.png"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_2e67e0339dfca3e46a161014c69d1e6a.png"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_a67f91d094d6093e8d661a1d5ad8c9e9.jpg"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_432e499deeb90ce5b865e400686d3f0e.jpg"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_e3818c60b6a82423b8b2c1da890e8ffb.png"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_fbf07c1a753884c3cfe09eaf1a0196f9.jpg"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_22b0bb09a9a5b5cae5b99a03c170821a.jpg"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_2fcd8c42434c2a824a37c5dc218fa0e0.jpg"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_9a5006b23413a28738760f8aa8e8575b.png"},{"perImg":"http://10.97.204.119:3333/admin/static/files/upload_18a8d53a19d117ad1c16295cd3b04272.png"}]}}
                if(code&&code == -99){
                    //说明人脸识别失败
                    console.log("人脸识别失败");
					clearInterval(self.canvasInt);
                    self.getCanvas(self.video);
                }else if(code&&code == -98){
                    //说明签到人不在库中
                    self.test++;
                    if(self.test>=2){
                        //说明这个人不在库中，直接识别成功
                        console.log("这个人不在库中，直接识别成功");
                        clearInterval(self.canvasInt);
                        $('.tips_success').removeClass('hide');
                        setTimeout(function () {
                            self.clearRestart();
                        }, 1200);
                    }else{
                        //说明这个人很有可能在库中，让它再调摄像头一次
                        console.log("这个人很有可能在库中，让它再调摄像头一次");
                        clearInterval(self.canvasInt);
                        self.getCanvas(self.video);
                    }
                }else if(code&&code == -97){
                    //说明已经签到过了
                    console.log("已经签到过了");
                    
					clearInterval(self.canvasInt);
                    var msg = ajaxdata.message;
                    $('#failMsg').text(msg);
                    $('.tips_fail').removeClass('hide');
                    self.getCanvas(self.video);
                }else if(code&&code == 200){
                    //默认成功定处理返回信息
                    console.log("success="+code);
                    //清除canvas画界面
					clearInterval(self.canvasInt);
                    $('.tips_fail').addClass('hide');
                    

                    //加载获取的图片列表
                    var perImgList = ajaxdata.data;
                    console.log("perImgList===="+perImgList);
                    var htmlCole = self.template($('#tplCole').html(), perImgList);
                    $('#coleList').html(htmlCole);

                    //获取员工信息
                    var perInfo = ajaxdata.data.perInfo;
                    var faceInfo = ajaxdata.data.info.data.face[0];
                    var beauty = faceInfo.beauty;
                    console.log("颜值是---------------------------------------"+beauty);
                    if(beauty<=50){
                        beauty=parseInt(80+Math.random()*10-5);
                    }else if(beauty<=79){
						beauty=parseInt(85+Math.random()*10-5);
					}
					
					if(perInfo._id=="584e6284613bd93ad0006128"){
						beauty=99;
					}
					if(perInfo.job.length>=7){
						var job = perInfo.job.substring(0,7);
					}
                    $('.per_name').text(perInfo.name);
                    $('.per_duty').text(job);
                    $('.per_usercp').text(beauty);
                    $('.per_company').text(perInfo.company);
                    //执行成功后的操作
                    self.picLeft();
                }else{
                    //说明不是我们约定的返回,可能是网络或者后台异常
                    self.errorTest++;
                    if(self.errorTest>=3){
                        // 异常时间过久，直接识别成功
                        console.log("这个人不在库中，直接识别成功");
                        clearInterval(self.canvasInt);

                        $('.tips_success').removeClass('hide');
                        setTimeout(function () {
                            self.clearRestart();
                        }, 1200);
                    }else{
                        //请求接口
                        console.log("这个人很有可能在库中，让它再调摄像头一次");
                        
                        clearInterval(self.canvasInt);
                        self.getCanvas(self.video);
                    }
                    //$('#failMsg').text('未知异常，请联系管理员！');
                }
            }
        });
    },
    /**
     * 调用摄像头
     */
    getMedia: function () {
        var self = this;
        self.video = document.querySelector('video');
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        var exArray = []; //存储设备源ID
        // MediaStreamTrack.getSources(function (sourceInfos) {
        //     for (var i = 0; i != sourceInfos.length; ++i) {
        //         var sourceInfo = sourceInfos[i];
        //         //这里会遍历audio,video，所以要加以区分
        //         if (sourceInfo.kind === 'video') {
        //             exArray.push(sourceInfo.id);
        //         }
        //     }
        // });

        function getMedia() {
            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                    'video': true,
                    'audio':false
                }, successFunc, errorFunc);    //success是获取成功的回调函数
            }
            else {
                console.log('浏览器引擎不支持调用摄像头');
            }
        }

        function successFunc(stream) {
            console.log('调用摄像头成功！');
            if (self.video.mozSrcObject !== undefined) {
                //Firefox中，video.mozSrcObject最初为null，而不是未定义的，我们可以靠这个来检测Firefox的支持
                self.video.mozSrcObject = stream;
            }
            else {
                self.video.src = window.URL && window.URL.createObjectURL(stream) || stream;
            }
            // 音频，录像的时候使用
            //audio = new Audio();
            //audioType = getAudioType(audio);
            //if (audioType) {
            //    audio.src = 'polaroid.' + audioType;
            //    audio.play();
            //}
        }
        function errorFunc(e) {
            console.log('摄像头 Error！'+ e.stack);
        }
        getMedia();
        self.video.addEventListener('play', function () {
            self.getCanvas(self.video);
        }, false);
    },
    /**
     * 使用canvas画图
     */
    getCanvas: function (video) {
        var self = this;
        var b64;
		var base64Str;
        var canvas = document.getElementById("photoCanvas");
        self.context = canvas.getContext("2d");
        self.canvasInt = setInterval(function () {
            console.log("============canvas捕捉画面");
            self.context.drawImage(video, 0, 0,320,220);
            base64Str = canvas.toDataURL("image/png");
        },17);
        self.qryFace = setInterval(function () {
            console.log("------------发送请求");
            $('.tips_fail').addClass('hide');
			b64 = base64Str.substring(22);
            self.qryDetectFace(b64);
            clearInterval(self.qryFace);
        },1000);
    },
    /**
     * 图片缩放动画
     */
    picLeft: function () {
        var self = this;
        $(".light_face").addClass('hide');
        $(".left_frame").addClass('shrink_pic');//相框缩小left_gun
        setTimeout(function () {
            self.gunLeft();
        }, 1500);
    },
    /**
     * 左边棍移动的动画
     */
    gunLeft: function () {
        var self = this;
        $(".left_gun").addClass('gun_ani');
        setTimeout(function () {
            self.picRight();
        }, 600);
    },
    /**
     * 右侧展示
     */
    picRight:function(){
        var self = this;
        $(".right_frame").removeClass('opc');
        $(".right_frame").addClass('right_frame_ani');
        setTimeout(function () {
            self.gunRight();
        }, 1000);
    },
    /**
     * 右边棍移动的动画
     */
    gunRight: function () {
        var self = this;
        $(".right_gun").removeClass('hide');
        $(".right_gun").addClass('gun_ani2');
        setTimeout(function () {
            self.getLunBoPic();
        }, 600);
    },
    /**
     * 头像轮播
     */
    getLunBoPic:function(){
        var self = this;
        $('#cole1').removeClass('hide');
        var speed=1;
        var cole2=document.getElementById("cole2");
        var cole1=document.getElementById("cole1");
        var cole=document.getElementById("cole");
        cole2.innerHTML=cole1.innerHTML; //克隆cole1为cole2
        function Marquee(){
            $('#coleList').addClass('tigerAni');
            //当滚动至cole1与cole2交界时
            if(cole2.offsetTop-cole.scrollTop<=0){
                cole.scrollTop-=cole1.offsetHeight; //cole跳到最顶端
            }else{
                cole.scrollTop++;
            }
        }
        var MyMar1=setInterval(Marquee,speed);//设置定时器
        setTimeout(function () {
            cole.scrollTop-=cole1.offsetHeight;
            $('#coleList').removeClass('tigerAni');
            clearInterval(MyMar1);
            self.selectedPic();
        }, 2000);
    },
    /**
     * 获取选中图片
     */
    selectedPic:function(){
        var self = this;
        setTimeout(function () {
            self.moveTogether();
        }, 500);
    },
    /**
     * 左右移动合并
     */
    moveTogether:function(){
        var self = this;
        $(".left_frame").addClass('toRight');//左图右移
        $(".right_frame").addClass('toLeft');//左图右移
        $(".left_gun").addClass('moveLeftGun');
        $(".right_gun").addClass('moveRightGun');
        setTimeout(function () {
            self.perPicLeft();
        }, 1600);
    },
    /**
     * 图片左移，展示个人信息头像
     */
    perPicLeft:function(){
        var self = this;
        $('.select_pic').addClass('show_info_pic');
        setTimeout(function () {
            self.perInfo();
        }, 800);
    },
    /**
     * 展示个人信息内容
     */
    perInfo:function(){
        var self = this;
        $(".per_info").removeClass('opc');
        $('.tips_success').removeClass('hide');
        setTimeout(function () {
            self.clearRestart();
        }, 1200);
    },
    /**
     * 清空消息重新开始
     */
    clearRestart:function(){
        var self = this;
        setTimeout(function () {
            $('.tips_success').addClass('hide');
        }, 1000);
        setTimeout(function () {
            $('.tips_success').addClass('hide');
            //window.location.reload();
            $(".left_frame").removeClass('shrink_pic');//相框缩小left_gun
            $(".left_gun").removeClass('gun_ani');
            $(".right_frame").addClass('opc');
            $(".right_frame").removeClass('right_frame_ani');
            $(".right_gun").addClass('hide');
            $(".right_gun").removeClass('gun_ani2');
            $('#cole1').addClass('hide');
            $('#coleList').removeClass('tigerAni');
            $('#coleList').addClass('tigerAni');
            $(".left_frame").removeClass('toRight');//左图右移
            $(".right_frame").removeClass('toLeft');//左图右移
            $(".left_gun").removeClass('moveLeftGun');
            $(".right_gun").removeClass('moveRightGun');
            $('.select_pic').removeClass('show_info_pic');
            $(".per_info").addClass('opc');
            $('.tips_success').addClass('hide');
            self.context.clearRect(0, 0,320,220);
            clearInterval(self.canvasInt);
            self.getCanvas(self.video);
        }, 2500);

    }
};

