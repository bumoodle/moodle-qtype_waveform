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
class question_waveform_qtype extends default_questiontype
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
	 * Prints the main content of the question, as displayed to the user.
	 */
	function print_question_formulation_and_controls(&$question, &$state, $cmoptions, $options)
	{
		global $CFG;

		//create a new LogicWave element
		if(empty($state->responses['']))
		$wave = self::waveform_from_question($question);
		else
		$wave = self::waveform_from_state($question, $state, true);
			
		//render the waveform
		$waveform = $wave->render(true, true);
			
		//below is unmodified moodle core code (ugh)
		$context = $this->get_context_by_category_id($question->category);

		$readonly = $options->readonly ? ' disabled="disabled"' : '';

		$formatoptions = new stdClass;
		$formatoptions->noclean = true;
		$formatoptions->para = false;

		// Print question formulation
		$questiontext = format_text($question->questiontext,
		$question->questiontextformat,
		$formatoptions, $cmoptions->course);

			
		include("$CFG->dirroot/question/type/waveform/display.html");
	}

	private static function waveform_from_question($question, $strip_answers = true)
	{
		return LogicWaveform::static_from_dynamic($question->options->wave, $question->name_prefix, true, false, $strip_answers);
	}

	private static function waveform_from_state($question, $state, $populate_feedback = false)
	{
		//if we've been instructed to populate feedback, get the feedback
		//which is generated from the last graded response
		if($populate_feedback && self::grading_occurred($state))
		$incorrect_decorators = self::feedback_from_state($question, $state);
		else
		$incorrect_decorators = array();
			
		//and generate the waveform from the most recently submitted response
		return self::waveform_from_response($question, $state->responses[''], $incorrect_decorators);
	}

	private static function grading_occurred($state)
	{
		return !empty($state->last_graded->responses['']);
	}

	/**
	 * Generates a waveform from a response entry, usually from the question state.
	 *
	 * @param stdClass 	$question 			The question data for the current question.
	 * @param stdClass	$response 			The response string / array for the current question.
	 * @param array		$decorator_classes  An array of arrays of classes, which correspond (outer) to the individual wavesets and (inner) to the
	 * 										wavecells which house that waveset.
	 */
	private static function waveform_from_response($question, $response, $decorator_classes=array())
	{

		//unserailize the response, reverting it to an array of wave states
		$waves = unserialize($response);

		//remove the wave name from the response data;
		//we use the known-value name from the question base
		foreach($waves as $id => $wave)
		{
			$waves[$id] = explode('|', $wave);
			$waves[$id] = $waves[$id][1];
		}

		//there are one more divisions than division dividers
		//$duration = substr_count($state->responses[''][0], ',') + 1;
		$duration = count(explode(',', $waves[0])); //TODO: replace with substr
		$wave = new LogicWaveform($duration);
			
			
		//extract the wave labels from the question
		$wavename = unserialize($question->options->wave);
		foreach($wavename as $id => $name)
		{
			$wavename[$id] = explode('|', $name);
			$wavename[$id] = $wavename[$id][0];
		}

			
		//and re-create each of the user's response waves
		foreach($waves as $i => $resp)
		{

			//if we have a list of incorrect waves, highlight them
			if(array_key_exists($i, $decorator_classes))
			$extras = $decorator_classes[$i];
			else
			$extras = array();

			//add the wave
			$wave->add_wave($question->name_prefix, $wavename[$i], $resp, false, false, $extras);

		}

		//return the newly created waveform
		return $wave;
			
	}

	private static function feedback_from_state($question, $state)
	{
		//create the answer and response waveform objects
		$correct = self::waveform_from_question($question, false);
		$incorrect = self::waveform_from_response($question, $state->last_graded->responses[''])->differences_from($correct);

		//and generate the feedback
		return self::feedback_from_incorrect($question, $correct, $incorrect);
	}

	private static function feedback_from_incorrect($question, $correct, $incorrect_items)
	{
		//create an empty array, which will hold a sparse array
		//of feedback for incorrect items
		$incorrect_sparse = array();
			
		switch($question->options->autofeedback)
		{
			//handle incorrect values on a per-segment basis
			case 'persegment':
					
				//create a sparse array of decorators for incorrect cells
				foreach($incorrect_items as $id => $incorrect)
					$incorrect_sparse[$id] = array_fill_keys($incorrect, 'wfIncorrect');

				break;
					
				//handle incorrect values on a per-wave basis
			case 'perwave':
					
				//FIXME make more apparent to the user that this is on a per-waveform basis
				 
				//fill the entirety of a wave with incorrect if it has any incorrect elements
				foreach($incorrect_items as $id => $incorrect)
					$incorrect_sparse[$id] = array_fill(0, $correct->get_duration(), 'allincorrect');

				break;
					
				//don't handle incorrect values (let the core question type do it)
			case 'allornothing':
			default:
				break;
		}
			
		//return the newly created sparse array of feeback
		return $incorrect_sparse;
	}


	/**
	 *
	 * Grades a given response using the ISIM simulator.
	 * @param $question 	The question information, including instructor configuration.
	 * @param $state 		The student's response to the question.
	 */
	function grade_responses(&$question, &$state, $cmoptions)
	{
			
		//create the answer and response waveform objects
		$correct = self::waveform_from_question($question, false);
		$response = self::waveform_from_state($question, $state);
			
		//find all incorrect segments
		$wrong_segments = $response->differences_from($correct);

		//callculate the grade according to the specified option
		switch($question->options->grademethod)
		{

			//all or nothing grading
			case 'allornothing':
					
				//if there were no wrong segments, the user gets full credit
				if(empty($wrong_segments))
				$state->raw_grade = 1;
				//otherwise, they get no credit
				else
				$state->raw_grade = 0;
					
				break;

			case 'persegment':

				//calculate the penalty per incorrect segment
				//(the user does not get points for fixed segments)
				$nonfixed_count = $correct->nonfixed_segment_count();
				$per_segment_penalty = $nonfixed_count ? (1 / $nonfixed_count) : 0;

				//assume full credit
				$state->raw_grade = 1;
					
				//for each wrong segment, take a penalty
				foreach($wrong_segments as $wave)
					$state->raw_grade -= count($wave)*$per_segment_penalty;
					
				break;
					
			case 'perwave':
			default:
					
				//calculate the penalty per wave
				//(the user does not get points for waves which are completely fixed)
				$nonfixed_count = $correct->nonfixed_wave_count();
				$per_wave_penalty = $nonfixed_count ? (1 / $nonfixed_count) : 0;
					
				//assume full credit
				$state->raw_grade = 1;
					
				//for each wave with at least one wrong segment, take a penalty
				foreach($wrong_segments as $wave)
				$state->raw_grade -= (count($wave) ? 1 : 0) * $per_wave_penalty;
					
				break;
		}
			
		//adjust for grading options
		$state->raw_grade = $state->raw_grade * $question->maxgrade;
			
		// Update the penalty.
		$state->penalty += $question->penalty * $question->maxgrade;

		// mark the state as graded
		$state->event = ($state->event ==  QUESTION_EVENTCLOSE) ? QUESTION_EVENTCLOSEANDGRADE : QUESTION_EVENTGRADE;

		//indicate that grading was complete
		return true;
	}

	/**
	 * @param object $question
	 * @return mixed either a integer score out of 1 that the average random
	 * guess by a student might give or an empty string which means will not
	 * calculate.
	 */
	function get_random_guess_score($question)
	{
		return '';
	}

	/*
	 * BEGIN UNMODIFIED MOODLE CORE CODE
	 */

	function move_files($questionid, $oldcontextid, $newcontextid)
	{
		parent::move_files($questionid, $oldcontextid, $newcontextid);
		$this->move_files_in_answers($questionid, $oldcontextid, $newcontextid);
	}

	protected function delete_files($questionid, $contextid)
	{
		parent::delete_files($questionid, $contextid);
		$this->delete_files_in_answers($questionid, $contextid);
	}

	function check_file_access($question, $state, $options, $contextid, $component, $filearea, $args)
	{
		if ($component == 'question' && $filearea == 'answerfeedback')
		{

			$answerid = reset($args); // itemid is answer id.
			$answers = &$question->options->answers;
			if (isset($state->responses['']))
			{
				$response = $state->responses[''];
			}
			else
			{
				$response = '';
			}

			return $options->feedback && isset($answers[$response]) && $answerid == $response;

		}
		else
		{
			return parent::check_file_access($question, $state, $options, $contextid, $component, $filearea, $args);
		}
	}



	/**
	 * Runs all the code required to set up and save an essay question for testing purposes.
	 * Alternate DB table prefix may be used to facilitate data deletion.
	 */
	function generate_test($name, $courseid = null)
	{
		global $DB;

		list($form, $question) = parent::generate_test($name, $courseid);
		$question->category = $form->category;

		$form->questiontext = "This question is really stupid";
		$form->penalty = 1;
		$form->defaultgrade = 1;
		$form->correctanswer = 0;
		$form->feedbacktrue = 'Can you justify such a hasty judgment?';
		$form->feedbackfalse = 'Wisdom has spoken!';

		if ($courseid)
		{
			$course = $DB->get_record('course', array('id' => $courseid));
		}

		return $this->save_question($question, $form);

	}
}
//// END OF CLASS ////

//////////////////////////////////////////////////////////////////////////
//// INITIATION - Without this line the question type is not in use... ///
//////////////////////////////////////////////////////////////////////////
question_register_questiontype(new question_waveform_qtype());
