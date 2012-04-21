  function rdigit(x) {
    return (x < 10) ? ('0'+x):(x+'');
  }

  function calculate_bydate(dd)
  {
    var convrad = Math.PI / 180;

    // calculate J_date
    var Jdate = toJulianDate(dd);

    var n = Math.round (Jdate - 2451545 - 0.0009 - (lw/360));

    var Jstar = 2451545 + 0.0009 + (lw/360) + n;

    // Solar Mean Anomaly
    var M = (357.5291 + 0.98560028 * (Jstar - 2451545)) % 360;

    // Equation of Center
    var C = 1.9148 * Math.sin(M*convrad) + 0.0200 * Math.sin(2*M*convrad) + 0.00300 * Math.sin(3*M*convrad);

    // Ecliptic Longitude
    var l = (M + 102.9372 + C + 180) % 360;
    console.log("Elliptic Longitude: " + l);

    // Solar Transit
    var Jtransit = Jstar + (0.0053 * Math.sin(M*convrad)) - (0.0069 * Math.sin(2*l*convrad));
    
    // Declination of the Sun
    var d = Math.asin(Math.sin(l*convrad) * Math.sin(23.45*convrad)) / convrad;
    
    // Hour angle
    var w0 = Math.acos( (Math.sin(-0.83*convrad) - (Math.sin(Phi*convrad)*Math.sin(d*convrad))) / (Math.cos(Phi*convrad)*Math.cos(d*convrad)) ) / convrad;
    console.log("W0: " + w0);
    console.log("Declination: " + d);
    
    // sunrise is negative, sunset is positive
    var ws = Math.acos((-Math.tan(Phi*convrad) * Math.tan(d*convrad))) / convrad;
    console.log("Sunrise / Sunset W: " + ws);
    
    var Jset = 2451545 + 0.0009 + ((w0+lw)/360) + n + (0.0053*Math.sin(M*convrad)) - 0.0069*Math.sin(2*l*convrad);
    var Jrise = 2*Jtransit - Jset;
    
    var dset = fromJulianDate(Jset);
    var drise = fromJulianDate(Jrise);
    var dtransit = fromJulianDate(Jtransit);

    var S_dd = dd.getHours()*3600 + dd.getMinutes()*60 + dd.getSeconds();
    var S_set = dset.T.h*3600 + dset.T.m*60 + dset.T.s;
    var S_rise = drise.T.h*3600 + drise.T.m*60 + drise.T.s;
    
    // 15° per hour
    var azimut = -ws + ((S_dd - S_rise)/3600 * 15);
    console.log("Azimut: " + azimut);

    dset.T.h = rdigit(dset.T.h);
    dset.T.m = rdigit(dset.T.m);
    dset.T.s = rdigit(dset.T.s);

    drise.T.h = rdigit(drise.T.h);
    drise.T.m = rdigit(drise.T.m);
    drise.T.s = rdigit(drise.T.s);

    dtransit.T.h = rdigit(dtransit.T.h);
    dtransit.T.m = rdigit(dtransit.T.m);
    dtransit.T.s = rdigit(dtransit.T.s);

    var tjset = dset.T.h + ":" + dset.T.m + ":" + dset.T.s;
    var tjrise = drise.T.h + ":" + drise.T.m + ":" + drise.T.s;
    var tjtransit = dtransit.T.h + ":" + dtransit.T.m + ":" + dtransit.T.s;

    var to_set = false, to_rise = false;
    if(S_dd < S_rise && (S_rise - S_dd) < 30*60) { to_rise = "(-" + Math.floor((S_rise - S_dd) / 60) + " min)"; }
    else if(S_dd > S_rise && S_dd < S_set && (S_set - S_dd) < 30*60) { to_set = "(-" + Math.floor((S_set - S_dd) / 60) + " min)"; }

    if( config.alarm === 1 && !config.alarm_disarmed && (S_rise > S_dd && (S_rise - S_dd) <= config.alarm_time*60) )
    {
      var d = Math.floor((S_set - S_dd) / 60);
      console.log("beep to sunrise: " + d);
      config.alarm_disarmed = true;
      navigator.notification.beep(1);
      window.plugins.statusBarNotification.notify("SunCycle", d + " min to sunrise");
    }
    else if(config.alarm === 1 && !config.alarm_disarmed && (S_dd > S_rise && S_set > S_dd && (S_set - S_dd) <= config.alarm_time*60) )
    {
      var d = Math.floor((S_set - S_dd) / 60);
      console.log("beep to sunset: " + d);
      config.alarm_disarmed = true;
      navigator.notification.beep(1);
      window.plugins.statusBarNotification.notify("SunCycle", d + " min to sunset");
    }
    
    
    if( (S_dd > S_rise && S_dd < S_set) || S_dd > S_set ) { config.alarm_disarmed = false; }

    return {set: tjset, rise: tjrise, transit: tjtransit, to_set : to_set, to_rise : to_rise, azimut: azimut.toFixed(3) + " S"};
  }

  function updateTime()
  {
    var dd = new Date();
    var d = dd.getDate(),
	m = (dd.getMonth()+1),
	y = dd.getFullYear();

    d = rdigit(d);
    m = rdigit(m);

    $("#cd").text(d + "/" + m + "/" + y);

    var ct_h = rdigit(dd.getHours()), ct_m = rdigit(dd.getMinutes()), ct_s = rdigit(dd.getSeconds());
    $("#ctime").text(ct_h + ":" + ct_m + ":" + ct_s);
    setTimeout(updateTime, 5000);
  }

  function calculate_sun(cls, sdate)
  {
    console.log(new Date(), "calculate_sun");

    var dd = new Date();
    var selector = "#";
    
    if(typeof cls !== 'undefined') { selector += cls + "_"; }
    if(typeof sdate !== 'undefined') { dd = sdate; }

    var d = dd.getDate(),
	m = (dd.getMonth()+1),
	y = dd.getFullYear();

    var r_today = calculate_bydate(dd);
    var tod = dd.setDate(dd.getDate()+1);
    var r_tomorrow = calculate_bydate(new Date(tod));
    $(selector + "jset").text(r_today.set);
    $(selector + "jrise").text(r_today.rise);
    $(selector + "jtransit").text(r_today.transit);
    $(selector + "azimut").text(r_today.azimut);

    if(r_today.to_rise !== false) {
      
     
      $("#to_rise").text(r_today.to_rise);
    }
    else { $("#to_rise").text(""); }

    if(r_today.to_set !== false) { $("#to_set").text(r_today.to_set); }
    else { $("#to_set").text(""); }

    $("#next_jset").text(r_tomorrow.set);
    $("#next_jrise").text(r_tomorrow.rise);
  }

  function div (a, b) { return Math.floor(a/b); }

  function toJulianDate(cd)
  {
    var d = cd.getDate(),
	m = (cd.getMonth()+1),
	y = cd.getFullYear();

    var p = (m <= 2 ) ? -1 : 0;
    var jdn = div(1461 * (y + 4800 + p), 4) +
      div((367 * (m - 2 - 12 * p)), 12) -
      div((3 * div(y + 4900 + p, 100)), 4) + d - 32075;

    return (jdn + ((cd.getHours()-12)/24) + (cd.getMinutes()/1440) + (cd.getSeconds()/86400));
  }

  function fromJulianDate(jd)
  {
    var hshift = (1 / 48);
    var ut = (jd + 0.5 + hshift),
	J = ut,
	j = J + 32044,
	g = Math.floor(j / 146097), dg = j % 146097,
	c = Math.floor(3*(Math.floor(dg / 36524) + 1)/4), dc = dg - (c*36524),
	b = Math.floor(dc/1461), db = dc % 1461,
	a = Math.floor(3*(Math.floor(db / 365) + 1)/4), da = (db - 365*a),
	y = g*400 + c*100 + b*4 +a,
	m = Math.floor((da*5 + 308) / 153) - 2,
	d = da - Math.floor(((m+4)*153) / 5) + 122,
	Y = y - 4800 + Math.floor((m+2)/12),
	M = ((m + 2) % 12) + 1,
	D = d + 1;

    var T = ut - Math.floor(ut);
    T = T * 86400;

    var hour = Math.floor(T / 3600),
	min = Math.floor((T-(3600*hour))/60),
	sec = Math.floor(T-(3600*hour) - (60*min));

    var legal_time = getDST();
    if(!legal_time) { hour = hour - 1; }

    return {Y: Y, M: M, D: Math.floor(D), T: {h: hour, m: min, s: sec}}
  }

  function getDST()
  {
    var year = new Date().getYear();
    if (year < 1000)
	year += 1900;

    var firstSwitch = 0;
    var secondSwitch = 0;
    var lastOffset = 99;

    // Loop through every month of the current year
    for (i = 0; i < 12; i++)
    {
      // Fetch the timezone value for the month
      var newDate = new Date(Date.UTC(year, i, 0, 0, 0, 0, 0));
      var tz = -1 * newDate.getTimezoneOffset() / 60;

      // Capture when a timzezone change occurs
      if (tz > lastOffset)
	  firstSwitch = i-1;
      else if (tz < lastOffset)
	  secondSwitch = i-1;

      lastOffset = tz;
    }

    // Go figure out date/time occurences a minute before
    // a DST adjustment occurs
    var secondDstDate = FindDstSwitchDate(year, secondSwitch);
    var firstDstDate = FindDstSwitchDate(year, firstSwitch);

    if (firstDstDate == null && secondDstDate == null)
      return false;
    else
    {
      var cd = new Date(), dst = false;
      if(cd > firstDstDate && cd < secondDstDate) { dst = true;}
      return dst;
    }
  }

  function FindDstSwitchDate(year, month)
  {
    // Set the starting date
    var baseDate = new Date(Date.UTC(year, month, 0, 0, 0, 0, 0));
    var changeDay = 0;
    var changeMinute = -1;
    var baseOffset = -1 * baseDate.getTimezoneOffset() / 60;

    // Loop to find the exact day a timezone adjust occurs
    for (day = 0; day < 50; day++)
    {
      var tmpDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      var tmpOffset = -1 * tmpDate.getTimezoneOffset() / 60;

      // Check if the timezone changed from one day to the next
      if (tmpOffset != baseOffset)
      {
	var minutes = 0;
	changeDay = day;

	// Back-up one day and grap the offset
	tmpDate = new Date(Date.UTC(year, month, day-1, 0, 0, 0, 0));
	tmpOffset = -1 * tmpDate.getTimezoneOffset() / 60;

	// Count the minutes until a timezone chnage occurs
	while (changeMinute == -1)
	{
	  tmpDate = new Date(Date.UTC(year, month, day-1, 0, minutes, 0, 0));
	  tmpOffset = -1 * tmpDate.getTimezoneOffset() / 60;

	  // Determine the exact minute a timezone change
	  // occurs
	  if (tmpOffset != baseOffset)
	  {
	    // Back-up a minute to get the date/time just
	    // before a timezone change occurs
	    tmpOffset = new Date(Date.UTC(year, month, day-1, 0, minutes-1, 0, 0));
	    changeMinute = minutes;
	    break;
	  }
	  else
	    minutes++;
	}

	// Capture the time stamp
	tmpDate = new Date(Date.UTC(year, month, day-1, 0, minutes-1, 0, 0));
	return tmpDate;
      }
    }
  }
