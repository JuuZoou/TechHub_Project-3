import bcrypt from 'bcrypt';
import { User } from './user.model';
import { Messages } from '../index/index.controller';

const authorization = (req, res) => {
    User.collection.count().then((usersLength) => {
        if( req.originalUrl === '/register/user') {
            if( req.body.mobileNumber.length < 6 || req.body.mobileNumber.length > 9 ){
                Messages.messageError.push('მობილურის ნომერი უნდა შეიცავდე მინ. 6 და მაქს. 9 სიმბოლოს');
                return res.redirect('/');
            };
            if(req.body.password !== req.body.passwordAgain){
                Messages.messageError.push('შეყვანილი პაროლები არ ემთხვევა ერთმანეთს');
                return res.redirect('/');
            };
            User.find( {email: req.body.email}, (err, email) => {
                if( email.length === 0 ){
                    const userDetails = {
                        userType: 'Person',
                        userId: `${usersLength+1}`,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        mobileNumber: req.body.mobileNumber,
                        email: req.body.email,
                        password: req.body.password
                    }
                    User.create( userDetails )
                    Messages.messageSuccess = ['თქვენ წარმატებით გაიარეთ რეგისტრაცია'];
                    return res.redirect('/');
                }else {
                    Messages.messageError.push("მომხმარებელი მსგავსი E-Mail -ით უკვე არსებობს");
                    return res.redirect("/");
                }
            })
        }
        if( req.originalUrl === '/register/company') {
            if( req.body.mobileNumber.length < 6 || req.body.mobileNumber.length > 9 ){
                Messages.messageError.push('მობილურის ნომერი უნდა შეიცავდე მინ. 6 და მაქს. 9 სიმბოლოს');
                return res.redirect('/');
            };
            if(req.body.password !== req.body.passwordAgain){
                Messages.messageError.push('შეყვანილი პაროლები არ ემთხვევა ერთმანეთს');
                return res.redirect('/');
            };
            User.find( {email: req.body.email}, (err, email) => {
                if( email.length === 0 ){
                    User.find( {companyName: req.body.companyName}, (err, company) => {
                        if(company.length > 0){
                            Messages.messageError.push('კომპანია ასეთი სახელით უკვე არის დარეგისტრირებული');
                            return res.redirect('/');
                        }else {
                            const userDetails = {
                                userType: 'Company',
                                userId: `${usersLength+1}`,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                mobileNumber: req.body.mobileNumber,
                                email: req.body.email,
                                companyName: req.body.companyName,
                                companyCode: req.body.companyCode,
                                password: req.body.password
                            }
                            User.create( userDetails )
                            Messages.messageSuccess = ['თქვენ წარმატებით დაარეგისტრირეთ კომპანია'];
                            res.redirect('/');
                        }
                    })
                }else {
                    Messages.messageError.push("კომპანია მსგავსი E-Mail -ით უკვე არსებობს");
                    return res.redirect("/");
                }
            })
        }
        if( req.originalUrl === '/login') {
            User.find( {email: req.body.email} )
            .then(data => {
                let isChecked = bcrypt.compareSync( req.body.password, data[0].password);

                if( data.length < 1 ){
                    Messages.messageError.push('არასწორი E-Mail მისამართი');
                    return res.redirect('/');
                }
                if( !isChecked ){
                    Messages.messageError.push("შეყვანილი პაროლი არასწორია");
                    return res.redirect("/");
                }
                // if( req.body.saveUser ){               
                //     res.cookie('User', data[0].userId)
                //     res.cookie('userIsSaved', 'true')
                //     Messages.messageSuccess = ['თქვენ წარმატებით გაიარეთ ავტორიზაცია'];
                //     return res.redirect(`/user/${data[0].userId}`);
                // }
                else {
                    res.cookie('User', data[0].userId)
                    Messages.messageSuccess = ['თქვენ წარმატებით გაიარეთ ავტორიზაცია'];
                    return res.redirect(`/user/${data[0].userId}`);
                }
            })
            .catch(err => console.error(err));
        }
    });
}

module.exports = { authorization }