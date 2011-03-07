/**
 * Another gradient plugin. It adds a gradient to the background of an element.
 *
 * @example $('div').gradable({ fromColor: '000000', toColor: '+3', direction: 'h' });
 *
 * @fromColor   [hex color value (#123456)]
 * @toColor     [hex color value (#123456)|rgb(11,22,33)|numeric delta (+10)]
 * @direction   [horizontal|h|vertical|v]
 *
 * @name gradable
 * @type jQuery
 * @cat Plugins/gradient
 * @author Stefano Pirra
 */
(function($){
    // default settings
    var defaults = {
        fromColor : '' , 
        toColor : '#EEEEEE' , 
        direction : 'vertical',
        quality: 1
    };
    // app settings
    var settings = {};
    
    // inner stuff
    var $gradeProperties = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            zindex: 0,
            thickness: 0
    };
    var newversion = true;
        
    var methods = {
        gradablee : function(options) {
            settings = $.extend({}, defaults, options || {});
            
            // apply the plugin
            return this.each(function() {
                var $this = $(this);
                grade($this);
            });
        },
        reset : function( ) {
            // apply the plugin
            return this.each(function() {
                var $this = $(this);
                var orig = $this.attr('orig-color');
                $this.css('background-color', function(index) {
                    return orig;
                });
                
                $this.children('.gradable-container').remove();
            });            
        }
    };

    $.fn.gradable = function(method) {
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.gradablee.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.gradable' );
        }
    };

    // the gradient engine
    function grade($this) { 
        // init stuff
        initSettings($this);
        initProps($this);
        
        // main div background
        var orig = $this.css('background-color');
        $this.attr('orig-color', function() { return orig; } );
        $this.css('background-color', function(index) {
            return settings.fromColor;
        });

        // how many div(s) I need to create?
        var granularity = 0;
        if (settings.direction == 'v')
          granularity = ($gradeProperties.height / $gradeProperties.thickness);
        else if (settings.direction == 'h')
          granularity = ($gradeProperties.width / $gradeProperties.thickness);
        else  
            return; //avoid looping when not useful
             
        if (newversion)
        {
            var divContainer = document.createElement('div');
            var $divContainer = $(divContainer);
            $divContainer.css({
                'position': 'absolute'
                }
            );
            $divContainer.css('z-index', function(){ return $gradeProperties.zindex; });
            $divContainer.css('width', function(){ return $gradeProperties.width; });
            $divContainer.css('height', function(){ return $gradeProperties.height; });
            $divContainer.css('top', function(){ return $gradeProperties.top; });
            $divContainer.css('left', function(){ return $gradeProperties.left; });
            $divContainer.addClass('gradable-container');
            
            $gradeProperties.top = $gradeProperties.left = 0;
        }
            
        // every div opacity increment
        var opacityFactor = (1 / granularity);
            
        // loop
        for (i = 0; i < granularity; i++)
        {
          var dd = document.createElement('div');
          var $dd = $(dd);
          
          $dd.css('position','absolute');
          $dd.css('background-color', function(index) {
            return settings.toColor;
          });
          $dd.css('opacity', function(index) {
            return (i * opacityFactor);
          });
          $dd.css('z-index', function(index) {
              return $gradeProperties.zindex;
          });
          
          if (settings.direction == 'v')
          {
            $dd.css('width', function(index) {
              return $gradeProperties.width;
            });
            $dd.css('height', function(index) {
              return $gradeProperties.thickness;
            });    
            $dd.css('top', function(index) {
              return (($gradeProperties.thickness * i) + $gradeProperties.top);
            });
            $dd.css('left', function(index) {
              return $gradeProperties.left;
            });
          }
          else if (settings.direction == 'h')
          {
            $dd.css('width', function(index) {
              return $gradeProperties.thickness;
            });
            $dd.css('height', function(index) {
              return $gradeProperties.height;
            });    
            $dd.css('top', function(index) {
              return $gradeProperties.top;
            });
            $dd.css('left', function(index) {
              return (($gradeProperties.thickness * i) + $gradeProperties.left);
            });
          }
          $dd.addClass('gradable');
      
          if (newversion)
            $divContainer.prepend(dd);
          else
            $this.prepend(dd);
        }
        
        if (newversion) $this.prepend(divContainer);
        
    } // function grade
      
    function initSettings($this) { 
        // 
        if (settings.quality > 1)
            settings.quality = 1;
        // 
        if (settings.direction.toLowerCase() == 'horizontal') 
            settings.direction = 'h';
        else if (settings.direction.toLowerCase() == 'vertical') 
            settings.direction = 'v';

        // 
        if (settings.fromColor == '')
            settings.fromColor = $this.css('background-color');
          
        // 
        if (settings.toColor.charAt(0) == '+' ||
            settings.toColor.charAt(0) == '-')
        {
            var res = "#";
            var delta = parseInt(settings.toColor);
            
            for (ii=1; ii<settings.fromColor.length; ii++)
            {
                var f = parseInt(settings.fromColor.charAt(ii), 16);
                var r = (f+delta);
                if (r>15) r = 15;
                else if (r<0) r = 0;
                res += r.toString(16);
            }
            settings.toColor = res;
        }
    };
          
    function initProps($this) {
        // main div properties
        $gradeProperties.top = $this.position().top;
        $gradeProperties.left = $this.position().left;
        $gradeProperties.width = $this.outerWidth();
        $gradeProperties.height = $this.outerHeight();
        $gradeProperties.zindex = $this.css('z-index');
        if (isNaN($gradeProperties.zindex)) 
            $gradeProperties.zindex = 10000;
        else
            $gradeProperties.zindex += 1;
        
        if (($this.css('position') == 'absolute')
            || ($this.css('position') == 'relative')
            || ($this.css('position') == 'fixed'))
        {
            $gradeProperties.top = 0;
            $gradeProperties.left = 0;
        }
        /*
        else if ($this.css('position') == 'static')
        {
            $gradeProperties.top = 0;
            $gradeProperties.left = 0;
            //pos = { top: 0, left: 0 };
        }*/
        
        // inner div's thickness
        $gradeProperties.thickness =  (1 / settings.quality);
    }
          
    // helper color parser
    function colorToHex(c) {
            c = c.toLowerCase();
            
            // #123ABC ==>  #123ABC
            if (c.length == 7 && c.charAt(0) == '#')
                return c;
                
            // 123ABC ==> #123ABC
            if (c.length == 6 && !isNaN(c))
                return "#"+c;

            // 12, 0x34, 1A
            var cNum = parseInt(c);
            if (isNaN(cNum))
                cNum = parseInt(c,16);
            if (!isNaN(cNum))
            {
                var cStr = c.toString();
                var res = '#';
                // 123 ==> #7B7B7B
                if (cNum<255)
                {
                    res += cNum.toString(16) + cNum.toString(16) + cNum.toString(16);
                }
                // 1234 ==> #001234
                else
                {
                    for (i=0; i<(6 - cStr.length); i++)
                        res += '0';
                    res += cStr;
                }
                return res;
            }
            
            // rgb(123,32,44) ==> #7b202c
            if (c.length>3 && c.substr(0,4) == 'rgb(')
            {
                var res = '#';
                
                c = c.replace('rgb(','').replace(')','');
                var rgb = c.split(',');
                for (i=0;i<rgb.length;i++)
                {
                    var s = parseInt(rgb[i]).toString(16);
                    if (s.length==0)
                        s = '00';
                    else if (s.length==1)
                        s = '0'+s;
                    res += s;
                }
                
                return res;
            }
                
            return c;
    }
        
})( jQuery );