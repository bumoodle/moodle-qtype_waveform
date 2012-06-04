<?php
/**
 * Moodle / PEAR Quickform Wrapper for the LogicWaveform Editor  
 */

require_once('HTML/QuickForm/element.php');
require_once("$CFG->dirroot/question/type/waveform/LogicWaveform.class.php");

class MoodleQuickForm_waveform extends HTML_QuickForm_element 
{
	
	static $first = 0;
	
	
	/**
	 * Core waveform class, which this class wraps.
	 */
	private $waveform;
	
	/**
	 *  Default options.
	 */
	private $_options = array('duration' => '35', 'student' => false, 'first'=> 'auto', 'last'=>true, 'toolbar'=> true, 'label' => true, 'dynamic' => true, 'count' => 2, 'value' => null);
	
	
	/**
	 * QuickForms constructor for the given waveform.
	 * 
	 * @param string $elementName
	 * @param string $elementLabel
	 * @param string $attributes
	 * @param unknown_type $options
	 */
	public function MoodleQuickForm_waveform($elementName=null, $elementLabel=null, $attributes=null, $options=null)
	{
		//ensure we have an array of options
		$options = (array)$options;
		
		//and copy each relevant option into the QuickForm element
        foreach ($options as $name=>$value)
            if (array_key_exists($name, $this->_options))
                $this->_options[$name] = $value;

               
        //attempt to automatically determine if this is the first waveform rendered, if requested
        if($this->_options['first'] == 'auto')
        	$this->_options['first'] = (self::$first < 2);

        
        self::$first++;
        
		//create the base LogicWaveform
		$this->waveform = new LogicWaveform($this->_options['duration'], !($this->_options['student']), $this->_options['toolbar'], $this->_options['label'], $this->_options['first'], $this->_options['dynamic'], $this->_options['last'], $elementName);
		

		parent::HTML_QuickForm_element($elementName, $elementLabel, $attributes);
	}
	

    function setName($name) 
    {
        $this->updateAttributes(array('name'=>$name));
    }

    function getName() 
    {
        return $this->getAttribute('name');
    }

    function setValue($value) 
    {
        $this->updateAttributes(array('value'=>$value));
    }

    function getValue() 
    {
        return $this->getAttribute('value');
    }
    
	function toHtml()
	{
		$value = @unserialize($this->getValue());
		
		//if a dynamically serialized array has been provided, unserialize it
		if(is_array($value))
		{
			$this->waveform->dynamic_add_waves($value);
		}
		//otherwise, create a blank waveset
		else		
		{
			//first, add the dynamic base (the correct code for creating new waves)
			$this->waveform->add_dynamic_base();
			
			//then, add the requested amount of blank waves
			for($i = 0; $i < $this->_options['count']; ++$i)
				$this->waveform->add_wave('dynamic', base_convert($i+10, 10, 36));
		}
		
		//return the rendered waveform
        return $this->waveform->render(true, true, $this->getName());
	}
}

HTML_QuickForm::registerElementType('waveform', "$CFG->dirroot/question/type/waveform/LogicWaveform.QuickForm.php", 'MoodleQuickForm_waveform');
