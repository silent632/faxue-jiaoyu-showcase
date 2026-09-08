import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFeedbackMail} from '../../lib/feedback-mail.js';
test('反馈邮件正确编码正文和特殊字符，不将点击视为发送',()=>{
 const body='页面：/cases/case-0012/\n疑问：权利 & 义务？#';const mail=buildFeedbackMail('yuqingliao486@gmail.com','内容疑问',body);const url=new URL(mail.href);
 assert.equal(url.pathname,'yuqingliao486@gmail.com');assert.equal(url.searchParams.get('body'),body);assert.equal(mail.copyRequired,false);
});
test('长意见不静默截断，改为保留主题并要求复制完整正文',()=>{
 const mail=buildFeedbackMail('yuqingliao486@gmail.com','功能建议','法理学学习体验'.repeat(300));assert.equal(mail.copyRequired,true);assert.equal(new URL(mail.href).searchParams.has('body'),false);
});
