class user{
    constructor(name,age){
        this.age=age;
        this.name=name;

    }
    login(){
        console.log("user name",this.name);
        console.log("you have logged in successfully");
    }
    logout(){
        console.log("ypu have logged out successfully");
         
    }
}
let User1=new user("ramesh",21);
console.log(User1.name);
User1.login();