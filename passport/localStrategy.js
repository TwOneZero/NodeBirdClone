const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.password
      },
      async (email, password, done) => {
        try {
          //db 에서 유저 검색
          const exUser = await User.findOne({ where: email });
          if (exUser) {
            //email이 있다면 암호 비교
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              //db의 패스워드와 req.body 로 들어온 password 가 일치
              done(null, exUser);
            } else {
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
          } else {
            //email 이 없다면
            done(null, false, { message: '가입되지 않은 회원입니다.' });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
