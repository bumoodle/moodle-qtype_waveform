<?php
/**
 * Defines the editing form for the shortanswer question type.
 *
 * @package   qtype_vhdl
 * @copyright 2011 Binghamton University
 * @author 	  Kyle Temkin <ktemkin@binghamton.edu>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) 
    die('Direct access to this script is forbidden.');    ///  It must be included from a Moodle page

require_once($CFG->dirroot.'/question/type/edit_question_form.php');


/**
 * Defines the editing form for the thruefalse question type.
 *
 * @copyright &copy; 2006 The Open University
 * @author T.J.Hunt@open.ac.uk
 * @license http://www.gnu.org/copyleft/gpl.html GNU Public License
 * @package questionbank
 * @subpackage questiontypes
 */

/**
 * Defines the editing form for the Waveform question type.
 *
 * @package   qtype_waveform
 * @copyright 2011 Binghamton University
 * @author 	  Kyle Temkin <ktemkin@binghamton.edu>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


//quickform extension to allow waveform input
require_once("$CFG->dirroot/question/type/waveform/LogicWaveform.QuickForm.php");

/**
 * waveform editing form definition.
 */
class qtype_waveform_edit_form extends question_edit_form 
{
	
    /**
     * Add question-type specific form fields.
     *
     * @param object $mform the form being built.
     */
    function definition_inner($mform) 
    {
    	
    	$mform->addelement('header', 'waveform', get_string('waveform', 'qtype_waveform'));
    	$mform->addElement('waveform', 'wave', '');
        $mform->setExpanded('waveform');
    	
        $mform->addelement('header', 'gradeoptions', get_string('gradeoptions', 'qtype_waveform'));
        $mform->setExpanded('gradeoptions');
        
        //$mform->addElement('advcheckbox', 'autofeedback', get_string('autofeedback', 'qtype_waveform'), '&nbsp;&nbsp;'.get_string('autofeedback_detail', 'qtype_waveform'), array("group" => ""), array('0', '1'));
        
        $grademodes = array
        (
        	'perwave' => get_string('grade_perwave', 'qtype_waveform'),
        	'persegment' => get_string('grade_persegment', 'qtype_waveform'),
        	'allornothing' => get_string('grade_allornothing', 'qtype_waveform') 
        );
        
        $feedbackmodes = array
        (
			'perwave' => get_string('feedback_perwave', 'qtype_waveform'),
        	'persegment' => get_string('feedback_persegment', 'qtype_waveform'),
        	'allornothing' => get_string('feedback_allornothing', 'qtype_waveform') 
        );
        
        
        $mform->addElement('select', 'grademethod', get_string('partialcredit', 'qtype_waveform'), $grademodes);
        $mform->addElement('select', 'autofeedback', get_string('autofeedback', 'qtype_waveform'), $feedbackmodes);
        $mform->addElement('static', 'feedback_warning', '',  get_string('feedback_warning', 'qtype_waveform'));


        //add settings for interactive (and similar) modes
        $this->add_interactive_settings();
    }

   
    function qtype() 
    {
        return 'waveform';
    }
}
