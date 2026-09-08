// 长邮件链接在部分客户端中会被截断；长内容改用复制正文，绝不静默丢弃。
export function buildFeedbackMail(email, category, body) {
 const subject = encodeURIComponent(`法理学研习平台使用反馈｜${category}`);
 const base = `mailto:${email}?subject=${subject}`;
 const full = `${base}&body=${encodeURIComponent(body)}`;
 return { href: full.length <= 1800 ? full : base, copyRequired: full.length > 1800 };
}
