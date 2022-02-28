const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

//회원가입
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

//로컬 로그인
router.post('/login', isLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      //서버 에러
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      //유저가 없다면 쿼리 스트링으로 error 메시지를 전달한다.
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      //req.login -> serializeUser 실행시킴
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      //세션 쿠키를 브라우저로 보내줌
      return res.redirect('/');
    });
  })(req, res, next); //미들웨어 내의 미들웨어 확장
});

//로컬 로그아웃
router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));

router.get(
  '/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router;
