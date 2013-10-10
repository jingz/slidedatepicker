// ui.slidedatepicker.js
// depend ui.core

(function  ($) {
    $.widget("ui.slidedatepicker",$.extend({},$.ui.mouse,{
       _init: function  () {
            this.element
                .addClass("ui-slidedatepicker-body ui-corner-all");
            this._drawCalendarScale();
            this._addHandler();
            this._mouseInit();
        },
        _drawCalendarScale: function  () {
            min = this._getData('min');
            minYear = (new Date(min)).getFullYear();
            max = this._getData('max');
            maxYear = (new Date(max)).getFullYear();
            diffYear = maxYear - minYear;
            pxPerDay = this.options.pxPerDay;
            // mark year
            months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC','JAN'];
            days   = [31,28,31,30,30,30,31,31,30,31,30,31];
            accDays = 0;
            for (var i=0; i < diffYear; i++) {
                yearLeftPos = (accDays*pxPerDay) + 3; // 3 is width of handler use as offsetLeft
                // add year marker
                $("<div class='ui-slidedatepicker-mark-year ui-corner-all'><span class='ui-slidedatepicker-y-marker'>"+(minYear+i)+"</span></div>")
                    .appendTo(this.element)
                    .css({position: 'absolute',left: yearLeftPos});
                d = this._isLeapYear(minYear + i) ? 366 : 365 ;
                sum = 0;
                //  mark months
                for (var j=0; j < 12; j++) {
                    if(j == 1 && this._isLeapYear(minYear + i)){
                        sum += 29; // is leap year
                    }
                    else{
                        sum += days[j];
                    }
                    monthLeftPos = (sum * pxPerDay) + yearLeftPos;
                    // add month marker and text
                    last = $("<div class='ui-slidedatepicker-mark-month ui-corner-all'><span class='ui-slidedatepicker-m-marker'>"+ months[j] +"</span></div>")
                        .appendTo(this.element)
                        .css({left:monthLeftPos+'px',height:"25%"})
                        .find('span').css({marginLeft:-(parseInt(days[j]*pxPerDay/2)+10)}); // 10 is constant width of text-month
                }
                accDays += d;
            }
            // add space 3 px for right handler exceeding
            last.parent().parent().css({paddingRight:3});
        },
        _addHandler: function  () {
            // add 3 div of selection
            wrapper = $("<div class='ui-slidedatepicker-wrapper'></div>");
            wrapper.prependTo(this.element);
            slideBar = $("<div class='ui-slidedatepicker-center-handler'></div>");
            slideBar.appendTo(wrapper);
            // init width handler;
            this._setData("widthHanlder",3); // fix
            $("<div class='ui-slidedatepicker-left-handler ui-corner-all'></div>")
                .appendTo(slideBar)
                .css({width:this._getData("widthHanlder")});
            $("<div class='ui-slidedatepicker-right-handler ui-corner-all'></div>")
                .appendTo(slideBar)
                .css({width:this._getData("widthHanlder")});
            var l = this.element.find(".ui-slidedatepicker-left-handler");
            var r = this.element.find(".ui-slidedatepicker-right-handler");
            var c = this.element.find(".ui-slidedatepicker-center-handler");
            startDate = this._getData("startDate");
            endDate   = this._getData("endDate");
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            startYear = startDate.getFullYear();
            startMonth = startDate.getMonth();
            endYear   = endDate.getFullYear();
            var diffDays = parseInt((endDate.getTime() - startDate.getTime())/(24*60*60*1000));
            handlerWidth = (diffDays * this.options.pxPerDay) + this._getData("widthHanlder")*2;
            min = new Date(this._getData("min"));
            diffDays = parseInt((startDate.getTime() - min.getTime())/(24*60*60*1000));
            handlerLeftPos = (diffDays * this.options.pxPerDay) + this._getData("widthHanlder");
            c.css({width: parseInt(handlerWidth),left: parseInt(handlerLeftPos)});
            this._setData("startDate",this._pos2date(handlerLeftPos - this._getData("widthHanlder")));
            this._setData("endDate",this._pos2date(handlerLeftPos + handlerWidth - this._getData("widthHanlder")*3 )); // 3 is paddingleft leftHanndler and right width 
            this._setData("handlers",{left:l,right:r,center:c});
            
            // add tootip
            $("<div id='ltip' >"+startDate.getDate()+"</div>").appendTo(l);
            $("<div id='rtip' >"+endDate.getDate()+"</div>").appendTo(r);
            
            var afterInitCB = this._getData("afterInit");
            $.isFunction(afterInitCB) ? afterInitCB([startDate,endDate]) : null;
        },
        _isLeapYear:function  (y) {
            return ((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0) ? true : false;
        },
        _mouseStart: function  (ev) {
            // is start on any handler?
            onElement = this._findStartOn(ev);
            this._setData("dragOn",onElement);
            this._setData("mouseStartAt",ev.pageX);
            this._setData("startScrollLeft",this.element.scrollLeft());
            var callback = this._getData('start'); 
            if ($.isFunction(callback)) callback(this._getValue());
            return;
        },
        _findStartOn: function  (ev) {
            // start on handler or panel
            handlers = this._getData("handlers");
            l = handlers.left;
            r = handlers.right;
            c = handlers.center;
            this._setData("leftPosHanlder",this._absPosX(c.offset().left));
            this._setData("widthHandler",c.outerWidth());
            absX = ev.pageX - this.element.offset().left;
            if( absX >= this._absPosX(l.offset().left) && absX <= this._absPosX(l.offset().left) + l.outerWidth()) return "leftHandler";
            if( absX >= this._absPosX(r.offset().left) && absX <= this._absPosX(r.offset().left) + r.outerWidth()) return "rightHandler";
            if( absX > this._absPosX(l.offset().left) + l.outerWidth() && absX < this._absPosX(r.offset().left)) return "centerHandler";
            return "panel";
        },
        _absPosX:function  (v) {
            return v - this.element.offset().left;
        },
        _mouseDrag: function  (ev) {
            offsetLeft = this._getData("widthHanlder");
            dragOn = this._getData("dragOn");
            mouseStartAt = this._getData("mouseStartAt");
            startScrollLeft = this._getData("startScrollLeft");
            dragSpeed = this.options.dragSpeed;
            distance = (ev.pageX - mouseStartAt) * dragSpeed;
            width = this.element.width();
            switch(dragOn){
                case "panel":
                    (distance) >= (width + this.element.offset().left)|| (distance + startScrollLeft + this.element.offset().left) <= 0 ? overflow = true : overflow = false;
                    !overflow ? this.element.scrollLeft((-distance + startScrollLeft)) : null;
                    break;
                case "leftHandler":
                    c = this._getData("handlers").center;
                    leftPos = this._getData("leftPosHanlder");
                    wHandler = this._getData("widthHandler");
                    leftPosHandler = leftPos + distance + startScrollLeft + offsetLeft;
                    rightPos = leftPos + wHandler + startScrollLeft - offsetLeft;
                    if(leftPosHandler >= offsetLeft
                      && rightPos - leftPosHandler >= this.options.pxPerDay){
                        c.css({left: parseInt(leftPosHandler),width: wHandler - distance});
                        this._setData("startDate",this._pos2date(leftPosHandler - offsetLeft));
                        var callback = this._getData('change'); 
                        if ($.isFunction(callback)) callback(this._getValue());
                        
                        // update tooltip
                        $("#ltip").text(this._getValue()[0].getDate());
                    }
                    break;
                case "rightHandler":
                    handlers = this._getData("handlers");
                    c = handlers.center;
                    leftPos = this._getData("leftPosHanlder");
                    wHandler = this._getData("widthHandler");
                    rightPos = leftPos + wHandler + distance + startScrollLeft;
                    if((rightPos) <= width + startScrollLeft 
                      && rightPos - (leftPos + startScrollLeft + 2*offsetLeft) >= this.options.pxPerDay ){
                        c.css({width: wHandler + distance});
                        this._setData("endDate",this._pos2date(rightPos - 2*offsetLeft));
                        var callback = this._getData('change'); 
                        if ($.isFunction(callback)) callback(this._getValue());
                        
                        // update tooltip
                        $("#rtip").text(this._getValue()[1].getDate());
                    }
                    break;
                case "centerHandler":
                    c = this._getData("handlers").center;
                    wHandler = this._getData("widthHandler");
                    leftPos = this._getData("leftPosHanlder");
                    leftPosHandler  = leftPos + distance + startScrollLeft + offsetLeft;
                    rightPosHandler = leftPos + wHandler + distance + startScrollLeft;
                    if((leftPosHandler) >= offsetLeft
                      && ((rightPosHandler) < width + startScrollLeft)){
                        c.css({left:leftPosHandler});
                        this._setData("startDate",this._pos2date(leftPosHandler - offsetLeft));
                        this._setData("endDate",this._pos2date(leftPosHandler + wHandler - 3*offsetLeft));
                        var callback = this._getData('change'); 
                        if ($.isFunction(callback)) callback(this._getValue());
                        $("#ltip").text(this._getValue()[0].getDate());
                        $("#rtip").text(this._getValue()[1].getDate());
                    }
                    break;
                default:
                
                    break;
            }
        },
        _mouseStop:function  (ev) {
            var dragOn = this._getData("dragOn");
            if(dragOn != "panel"){
            var callback = this._getData('stop'); 
            if ($.isFunction(callback)) callback(this._getValue());}
        },
        _pos2date:function  (posX) {
            daysFromMin = parseInt((posX)/this.options.pxPerDay);
            min = new Date(this._getData("min"));
            min.setDate(min.getDate()+daysFromMin);
            return min;
        },
        destroy: function  () {
            this._mouseDestroy();
        },
        _getStartDate:function  () {
            return this._getData("startDate");
        },
        _getEndDate:function  () {
            return this._getData("endDate");
        },
        _getValue:function  () {
            return [this._getStartDate(),this._getEndDate()];
        }
    }));
    
    $.ui.slidedatepicker.defaults = $.extend({},$.ui.mouse.defaults,{
        startDate: "Mar 1, 2009", // format "May 25, 2008"
        endDate: "May 31, 2009",
        min: "Jan 1, 2007",
        max: "Dec 31, 2012",
        sensitivity: 20,
        dragSpeed: 1,
        pxPerDay: 1,
        tooltips: true,
        showFormat: null,
        change: function  () {},
        start: function  () {},
        stop: function  () {},
        afterInit:function  () {},
        // physical
        rColor: "red",
        lColor: "red",
        cColor: "blue",
        daysGap: 1
    });
})(jQuery);