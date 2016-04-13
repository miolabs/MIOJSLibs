/**
 * Created by godshadow on 11/3/16.
 */

// Prototypes
Date.prototype.getMonthString = function()
{
    return MIODateGetStringForMonth(this.getMonth());
};

Date.prototype.getDayString = function()
{
    return MIODateGetStringForDay(this.getDay());
};

Date.prototype.monthDays = function(){
    var d= new Date(this.getFullYear(), this.getMonth()+1, 0);
    return d.getDate();
}