const mycols = [
    {name:'t', disp:'Symbol', klass:'symbol', type:'ticker'},
    {name:'e', disp:'Exchange', klass:'exchange', type:'string'},
    {name:'l', disp:'Last Price', klass:'price', type:'string'},
    {name:'c', disp:'Change', klass:'change', type:'change'},
    {name:'cp', disp:'% Change', klass:'pctchg', type:'pctchg'},
    {name:'lt_dts', disp:'Last Traded', klass:'datetime', type:'datetime'},
]
function cellByType(type,v,r){
    if(type==='change'){
        return mkElem('span', {className:v[0]==='+'?"up":"down"}, v);
    }else if(type==='pctchg'){
        return mkElem('span', {className:v>0?"up":"down"}, v+"%");
    }else if(type==='datetime'){
        return v.replace("T"," ").replace("Z","");
    }else if(type==='ticker'){
        return mkElem('a', {href:"https://www.google.com/finance?q="+r.e+":"+v, target:"_blank"}, v);
    }else{
        return v;
    }
}
function mkComp(spec){
    return React.createClass(spec);
}
function mkElem(tag,props,children){
    return React.createElement(tag,props,children);
}
const th = mkComp({
    render: function(){
        return mkElem('th', {className:"gth"}, this.props.val);
    }
});
const thead = mkComp({
    render: function(){
        return mkElem('thead', {},
            mkElem("tr", {}, this.props.cols.map(function(c,j){
                return mkElem(th, {key:j, val:c.disp})
            }))
        )
    }
});
const td = mkComp({
    render: function(){
        const c=this.props.col, v=this.props.val, r=this.props.row;
        return mkElem('td', {className:c.klass}, cellByType(c.type,v,r));
    }
});
const tr = mkComp({
    render: function(){
        const myrow=this.props.row;
        return mkElem("tr", {}, this.props.cols.map(function(c,j){
            return mkElem(td, {key:j, val:myrow[c.name], col:c, row:myrow});
        }));
    }
});
const tbody = mkComp({
    render: function(){
        const mycols=this.props.cols;
        return mkElem('tbody', {}, this.props.rows.map(function(r,j){
            return mkElem(tr, {key:j, row:r, cols:mycols});
        }));
    }
});
const nyse_holidays=[
    "2017/11/23",
    "2017/12/25",
    "2018/01/01",
    "2018/01/15",
    "2018/02/19",
    "2018/03/30",
    "2018/05/28",
    "2018/07/04",
    "2018/09/03",
    "2018/11/22",
    "2018/12/25",
];
const holidays = nyse_holidays.map(function(d){
    const p=d.split('/');
    const nd=new Date(p[0],p[1]-1,p[2]);
    return nd.toDateString();
});
function isWeekend(d){
    const name = d.substr(0,3);
    return name==='Sat' || name==='Sun';
}
function isTradingDay(d){
    return !isWeekend(d) && !isHoliday(d);
}
function isHoliday(d){
    return holidays.indexOf(d)>=0;
}
function isTradingHour(){
    const d=new Date(),h=d.getUTCHours();
    const open=isTradingDay(d.toDateString());
    return open && h<20 && (h>13 || (h==13 && 30<=d.getMinutes()));
}
const table = mkComp({
    getInitialState: function(){
        return {rows:[]}
    },
    onTimer: function(){
        if(isTradingHour()){
            this.googleApi();
        }
    },
    googleApi: function(){
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(json){
                this.setState({rows:json})
            }.bind(this),
            error: function(xhr, status, err){
                console.error(status, err.toString());
            }
        });
    },
    componentDidMount: function() {
        this.googleApi();
        setInterval(this.onTimer, 2000);
    },
    render: function(){
	const mycols=this.props.cols;
        return mkElem('table', {},[
            mkElem(thead, {key:0, cols:mycols}),
            mkElem(tbody, {key:1, cols:mycols, rows:this.state.rows})
        ])
    }
});
ReactDOM.render(
    mkElem(table, {url:"https://ggu.herokuapp.com/get", cols:mycols}),
    document.getElementById('gug')
);
