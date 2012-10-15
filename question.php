<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * True-false question definition class.
 *
 * @package    qtype
 * @subpackage truefalse
 * @copyright  2009 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


defined('MOODLE_INTERNAL') || die();


/**
 * Waveform question definition class.
 *
 * @copyright  2012 Binghamton University
 * @author     Kyle J. Temkin <ktemkin@binghamton.edu>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class qtype_waveform_question extends question_graded_automatically 
{
    /**
     * Returns an array containing the data expected in a valid submission of a usercode question.
     */
    public function get_expected_data() 
    {
        //expect only the raw waveform data
        return array('answer' => PARAM_RAW);
    }


    /**
     * Indicates that no sample "correct response" is applicable.
     * TODO: possibly implement me?
     */
    public function get_correct_response() 
    {
        return null;
    }

    /**
     * Determines if the given response is complete, and thus should be graded.
     */
    public function is_complete_response(array $response)
    {
        //if no answer has been set, the response must be incomplete
        if(!array_key_exists('answer', $response) || !trim($response['answer']))
            return false;

        //TODO: check for a valid response from the javascript (beyond being there?)
        return true;
    }

    /**
     * Returns true iff the given response is gradeable.
     */
    public function is_gradable_response(array $response)
    {
        //any complete response is gradeable
        return $this->is_complete_response($response);
    }

    /**
     * Returns true iff $a and $b both refer to the same response.
     * This is used to prevent duplicate submissions from being graded. 
     */
    public function is_same_response(array $a, array $b)
    {
        //compare the two answers
        return question_utils::arrays_same_at_key_missing_is_blank($a, $b, 'answer');
    }


    /**
     * Returns a short-but-compelte summary of the given response.
     */
    public function summarise_response(array $response)
    {
        //TODO: fixme
        return 'waveform';
    }

     /**
     * Returns an error message if the given response doesn't validate (isn't complete),
     * or null if the response is gradeable.
     */
    public function get_validation_error(array $response)
    {
        //FIXME: todo
        return null;

    }

    /**
     * Grades a student's attempt by analyzing the waveform against a "correct" reference design.
     *
	 * @param $question 	The question information, including instructor configuration.
	 * @param $state 		The student's response to the question.
	 */
	function grade_response(array $response)
	{

        $correct = $this->get_reference_waveform(false);
        $response = $this->waveform_from_response($response);
			
		//get a list of all segments which differ from the reference waveform, and are thus incorrect
		$wrong_segments = $response->differences_from($correct);

		//callculate the grade according to the specified option
		switch($this->grademethod)
		{

			//all or nothing grading
			case 'allornothing':
					
				//if there were no wrong segments, the user gets full credit
				if(empty($wrong_segments))
                    $raw_grade = 1;
				//otherwise, they get no credit
				else
                    $raw_grade = 0;
					
				break;

			case 'persegment':

				//calculate the penalty per incorrect segment
				//(the user does not get points for fixed segments)
				$nonfixed_count = $correct->nonfixed_segment_count();
				$per_segment_penalty = $nonfixed_count ? (1 / $nonfixed_count) : 0;

				//assume full credit
				$raw_grade = 1;
					
				//for each wrong segment, take a penalty
				foreach($wrong_segments as $wave)
					$raw_grade -= count($wave) * $per_segment_penalty;
					
				break;
					
			case 'perwave':
			default:
					
				//calculate the penalty per wave
				//(the user does not get points for waves which are completely fixed)
				$nonfixed_count = $correct->nonfixed_wave_count();
				$per_wave_penalty = $nonfixed_count ? (1 / $nonfixed_count) : 0;
					
				//assume full credit
                $raw_grade = 1;
					
				//for each wave with at least one wrong segment, take a penalty
				foreach($wrong_segments as $wave)
                    $raw_grade -= (count($wave) ? 1 : 0) * $per_wave_penalty;
					
				break;
		}
			
		//adjust for grading options
		//$state->raw_grade = $state->raw_grade * $question->maxgrade;
			
		// Update the penalty.
		//$state->penalty += $question->penalty * $question->maxgrade;

		// mark the state as graded
		//$state->event = ($state->event ==  QUESTION_EVENTCLOSE) ? QUESTION_EVENTCLOSEANDGRADE : QUESTION_EVENTGRADE;

		//indicate that grading was complete
		return array($raw_grade, question_state::graded_state_for_fraction($raw_grade));
	}


    /*
    private static function waveform_from_question($question, $strip_answers = true)
	{
		return LogicWaveform::static_from_dynamic($question->options->wave, $question->name_prefix, true, false, $strip_answers);
    }
     */

    /**
      * Returns the reference waveform which will be used for grading this question, wrapped in a LogicWaveform.
      * 
      * @param bool $strip_answers  If true, any "answer" segment (which can be specified by the respondant) will be removed.
      * @return LogicWaveform       The reference waveform used to grade this question.
      */
     public function get_reference_waveform($strip_answers = true, $element_name = null)
     {
        //TODO: uniqueify waveform beyond id?
 		return LogicWaveform::static_from_dynamic($this->wave, $this->id, true, false, $strip_answers);
     }

    /*
    private static function waveform_from_response(array $response, $populate_feedback = false)
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
     */

	/**
	 * Generates a waveform from a response entry, usually from the question state.
	 *
	 * @param stdClass 	$question 			The question data for the current question.
	 * @param stdClass	$response 			The response string / array for the current question.
	 * @param array		$decorator_classes  An array of arrays of classes, which correspond (outer) to the individual wavesets and (inner) to the
	 * 										wavecells which house that waveset.
	 */
    public function waveform_from_response(array $response, $decorator_classes = array())
    {
   
        //unserailize the response, reverting it to an array of wave states
		$waves = unserialize($response['answer']);

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
		$wavename = unserialize($this->wave);
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
            //FIXME: uniqueify nameprefix beyond ID?
			$wave->add_wave($this->id, $wavename[$i], $resp, false, false, $extras);

		}

		//return the newly created waveform
		return $wave;
			
	}

    /**
     * Generates the appropriate question feedback given the user's response.
     */
	public function feedback_from_response(array $response)
	{
		//create the answer and response waveform objects
		$correct = $this->get_reference_waveform(false);
		$incorrect = $this->waveform_from_response($response)->differences_from($correct);

		//and generate the feedback
		return $this->feedback_from_incorrect($correct, $incorrect);
	}

    /**
     * Generates the appropriate question feedback given a list of incorrect segments.
     */
	private function feedback_from_incorrect($correct, $incorrect_items)
	{
		//create an empty array, which will hold a sparse array
		//of feedback for incorrect items
		$incorrect_sparse = array();
			
		switch($this->autofeedback)
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




}
