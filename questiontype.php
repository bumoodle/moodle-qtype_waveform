<?php
/**
 * Defines the editing form for the shortanswer question type.
 *
 * @package   qtype_waveform
 * @copyright 2011 Binghamton University
 * @author 	  Kyle Temkin <ktemkin@binghamton.edu>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if(!defined('MOODLE_INTERNAL'))
die();

require_once($CFG->libdir.'/form/filemanager.php');
require_once("$CFG->dirroot/question/type/waveform/LogicWaveform.class.php");

/////////////////
/// Waveform  ///
/////////////////

/// QUESTION TYPE CLASS //////////////////
/**
 * @package questionbank
 * @subpackage questiontypes
 */
class qtype_waveform extends question_type
{

	/**
	 * Short name for the question type.
	 */
	function name()
	{
		return 'waveform';
	}

	/**
	 * Each of the following question fields are stored in the database, and correspond to instructor preferences.
	 */


	function extra_question_fields()
	{
		return array('question_waveform', 'wave', 'autofeedback', 'grademethod');
	}


	/**
	 * The name of the 'id' row in the custom database table.
	 */
	function questionid_column_name()
	{
		return 'question';
	}


	/**
	 * Loads the question type specific options for the question.
	 */
	function get_question_options(&$question)
	{
		global $DB, $OUTPUT;

		// Get additional information from database
		// and attach it to the question object
		if (!$question->options = $DB->get_record('question_waveform', array('question' => $question->id)))
		{
			echo $OUTPUT->notification('Error: Missing question options!');
			return false;
		}
		// Load the answers
		if (!$question->options->answers = $DB->get_records('question_waveform', array('question' =>  $question->id), 'id ASC'))
		{
			echo $OUTPUT->notification('Error: Missing question answers for waveform question ' . $question->id . '!');
			return false;
		}

		return true;
	}


	/**
	 * Deletes ancillary information along with the question.
	 */
	function delete_question($questionid, $contextid)
	{
		global $DB;
		$DB->delete_records('question_waveform', array('question' => $questionid));

		//TODO: Consider deleting the submitted testbench along with the file.
		//(Without this, it remains in the "recent files" in the file manager, as per standard moodle behavior.)

		parent::delete_question($questionid, $contextid);
	}

	/**
	 * Determines if the user's response remains unchanged since they hit submit the last time.
	 */
	function compare_responses($question, $state, $teststate)
	{
		return ($state->responses[''] == $teststate->responses['']);
	}

	/**
	 * Returns a sample response for the instructor's convenience.
	 * Not implemented, as this would take a huge amount of reverse engineering the test-bench.
	 */
	function get_correct_responses(&$question, &$state)
	{
		return null;
	}


	/**
	 * @param object $question
	 * @return mixed either a integer score out of 1 that the average random
	 * guess by a student might give or an empty string which means will not
	 * calculate.
	 */
	function get_random_guess_score($question)
	{
		return null;
	}

	

}
