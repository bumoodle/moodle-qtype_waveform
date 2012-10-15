<?php

class LogicWaveform
{

	private $out_buffer;
	private $duration;
	private $include_path;
	private $name;
	
	private $wave_count;
	private $waves;
	
	//mode flags
	private $instructor_mode, $dynamic_editor, $show_toolbar, $show_header, $show_label;

	function __construct($duration = 40, $instructor_mode = false, $show_toolbar = true, $show_label = true, $send_scripts = true, $dynamic_edit = false, $show_footer = true, $name = null, $allow_unknown = true, $include_path = null)
	{
		//attempt to automatically determine the include path if appropriate
		if($include_path==null)
			$include_path = str_replace(realpath($_SERVER['DOCUMENT_ROOT']), '', dirname(__FILE__));

		//copy fields from constructor
		$this->duration = $duration;
		$this->name = $name;
		$this->instructor_mode = $instructor_mode;
		$this->dynamic_edit = $dynamic_edit;
		$this->include_path = $include_path;
		$this->show_toolbar = $show_toolbar;
		$this->send_scripts = $send_scripts;
		$this->show_label = $show_label;
		$this->show_footer = $show_footer;
		
	}

    function render($can_edit = true, $return = false, $name = null)
	{
		
		//establish local variables for template use
		$dynamic_edit = $this->dynamic_edit;
		$instructor_mode = $this->instructor_mode;
		$include_path = $this->include_path;
		$send_scripts = $this->send_scripts;

        //if no name override was provided, use the given name for the form
        if($name == null)
            $name = $this->name;

		//if the return flag is said, buffer the output
		//instead of sending it in the HTML stream
		if($return)
			ob_start();
		
		include 'templates/head.tpl.php';
			
		echo $this->out_buffer;
		
		if($this->show_toolbar)
			include 'templates/toolbar.tpl.php';
		
		if($this->show_footer)
			include 'templates/foot.tpl.php';
			
		//return the buffer, if requested
		if($return)
			return ob_get_clean();

	}

	
	function add_wave($name, $label, $initial_values = array(), $hidden=false, $strip_nonfixed = false, $extra_classes = array())
	{
		
		//if the logicwaveform hasn't been given a name,
		//use this instead
		if($this->name == null)
			$this->name = $name;
		
			
		//TODO: handle string $values
		if(is_string($initial_values))
			$initial_values = self::classes_from_shorthand($initial_values, $strip_nonfixed);

		//establish local variables for template use
		$maxDuration = $this->duration;
		$hide_name = !$this->show_label;
		$dynamic_edit = $this->dynamic_edit;

		++$this->wave_count;

		//store the wave internally for comparison
		$this->waves[] = $initial_values;
		
		
		
		//add the wave template to the output buffer
		ob_start();
		include 'templates/wave.tpl.php';
		$this->out_buffer .= ob_get_clean();
	}
	
	
	
	function dynamic_add_waves($waves)
	{
	
		//if we've been passed a string, try to unserialize it
		if(is_string($waves))
			$waves = unserialize($waves);
			
		//if we're using the dynamic editor, create an empty wave for the purposes of editing
		if(!$this->wave_count())
		{
			$this->override_duration(substr_count($waves[0], ',') + 1);
			$this->add_wave('dynamic_base', 'x', array(), true);
		}
			
		//process each of the waves
		foreach($waves as $wave)
		{	

			$split = explode('|', $wave);
			$this->add_wave('', $split[0], $split[1]);
		}
	}
	
	function add_dynamic_base()
	{
		$this->add_wave('dynamic_base', 'x', array(), true);	
	}

	function wave_count()
	{
		return $this->wave_count;		
	}
	
	static function classes_from_shorthand($shorthand, $strip_nonfixed = false)
	{
		$out = array();
		$shorthand = explode(',',  $shorthand);

		//replace each shorthand item with an appropriate class name
		foreach($shorthand as $item)
			$out[] = self::expand_class_name($item, $strip_nonfixed);

		//and return the array
		return $out;
	}

	static function expand_class_name($shorthand, $strip_nonfixed = false)
	{
		$prefix = '';
		$suffix = '';

		//parse the prefix character
		switch($shorthand[0])
		{
			case 'a':
				$prefix = 'auto';
				break;

			case 'f':
				$prefix = 'fixed';
				break;

		}

		if($strip_nonfixed && $prefix != 'fixed')
			return 'autoone';
	
		
		//and parse the suffix character
		switch($shorthand[1])
		{
			case '0':
				$suffix = 'zero';
				break;
			case '1':
				$suffix = 'one';
				break;
			case 'X':
				$suffix = 'unknown';
				break;
		}

		//combine prefix and suffix to create a the CSS class name
		return $prefix . $suffix;
	}
	
	
	static function javascript_init_variables($vars = array())
	{
		echo '<script type="text/javascript">';
		
		//for each of the variables requested, initialize a javascript variable
		foreach($vars as $varname => $var)
			if(is_numeric($var))
				echo "$varname = $var;\n";
			else
				echo "$varname = \"$var\";\n";		
		
		echo '</script>';
	}
	
	function override_duration($duration)
	{
		$this->duration = $duration;
	}
	
	static function static_from_dynamic($wavelist, $name, $allow_unknown=true, $instructor_mode = false, $strip_nonfixed = false)
	{
		if(is_string($wavelist))
		{
			//convert the dynamic wavelist to an array of waves
			$wavelist = unserialize($wavelist);

			//and extract the wave names
			foreach($wavelist as &$wave)
			{
				$wave = explode('|', $wave);
				$wavename = array_shift($wave);
				
				$wave = self::classes_from_shorthand($wave[0], $strip_nonfixed);
				$wave['name'] = $wavename;
			}
		}
			
		//create the LogicWaveform object to populate
		$waveform = new LogicWaveform(count($wavelist[0]) - 1, false, true, true, true, false, true, $name, true);

		foreach($wavelist as &$wave)
			$waveform->add_wave('', $wave['name'], $wave);
			
		return $waveform;
	}
	
	function get_waves()
	{
		return $this->waves;
	}
	
	function get_duration()
	{
		return $this->duration;
	}
	
	function differences_from($other)
	{
		$ow = $other->get_waves();
		$diff = array();
		
		//for each time division, check to ensure that the values or the same
		foreach($this->waves as $id => $val)
			foreach($val as $t => $timediv)
				if( (!array_key_exists($t, $ow[$id])) || (self::logic_value($timediv) != self::logic_value($ow[$id][$t])))
					$diff[$id][] = $t;
			 

		return $diff;
	}
	
	function nonfixed_segment_count()
	{
		$count = 0;
		
		//for each wave
		foreach($this->waves as $wave)
			//for each segment
			foreach($wave as $name => $segment)
			{
				//don't count wave properties as segments
				if(!is_numeric($name))
					continue;
				
				//if the segment isn't fixed, count it
				if(!self::is_fixed($segment))
					++$count;
			}
					
		return $count;
	}
	
	function nonfixed_wave_count()
	{
		$count = 0;
		
		//for each wave
		foreach($this->waves as $wave)
		{
			$all_fixed = true;	
		
			//for each segment
			foreach($wave as $name => $segment)
			{
				//skip wave properties
				if(!is_numeric($name))
					continue;
				
				
				//if the segment isn't fixed, set the flag to flase
				$all_fixed &= self::is_fixed($segment);
			}
				
			
			//if there were nonfixed segments, this is wave upon which
			//the user is being grade
			if(!$all_fixed)
				++$count;
				
		}
					
		return $count;
		
	}
	
	function equals($other)
	{
		return !count($this->differences_from($other));		
	}
	
	
	static function logic_value($a)
	{
		switch($a)
		{
			case 'fixedone':
			case 'autoone':
			case 'one':
				return '1';
			
			case 'fixedzero':
			case 'autozero':
			case 'zero':
				return '0';
				
			case 'fixedunknown':
			case 'autounknown':
			case 'unknown':
				return 'x';
		}
		
		return '';
	}
	
	public static function is_fixed($class)
	{
		return ($class == "fixedone" || $class == "fixedzero" || $class == "fixedunknown");		
	}
	
	
}

