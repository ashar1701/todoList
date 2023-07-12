
module.exports=getDate;  //exports the function to app.js and runs it there

function getDate(){
    var date=new Date();
    var options={           //how to get a formatted version of the date
    weekday:"long",
    day:"numeric",
    month:"long",
    }
    var today=date.toLocaleDateString("en-US",options);    //method to format the date
    return today
}
