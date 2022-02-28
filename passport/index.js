const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  //
  passport.serializeUser((user, done) => {
    done(null, user.id); //세션에 유저의 id 저장
  });

  passport.deserializeUser((id, done) => {
    //req.user , req.isAuthenticated() 를 반환
    User.findOne({ where: { id } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
  kakao();
};
