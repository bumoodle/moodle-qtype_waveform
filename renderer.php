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
 * True-false question renderer class.
 *
 * @package    qtype
 * @subpackage truefalse
 * @copyright  2009 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


defined('MOODLE_INTERNAL') || die();


/**
 * Generates the output for true-false questions.
 *
 * @copyright  2009 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class qtype_waveform_renderer extends qtype_renderer 
{
    /**
     *  Returns the main formulation (question response area) and controls for a Waveform question.
     */
    public function formulation_and_controls(question_attempt $qa, question_display_options $options)
    {
        //get the question, and the user's last response
        $question = $qa->get_question();
        $response = $qa->get_last_qt_var('answer', ''); 

        //get the field name that should be used to submit the answer code
        $field_name = $qa->get_qt_field_name('answer');

        //get the last (current) step, and the last submitted step
        $last_step = $qa->get_last_step(); //$qa->get_last_step_with_qt_var('answer');
        $last_submitted_step = $qa->get_last_step_with_qt_var('-submit');

        //get the decorators for incorrect answers
        if($last_submitted_step->get_qt_var('answer') == null)
            $incorrect_decorators = array();
        else
            $incorrect_decorators = $question->feedback_from_response(array('answer' => $last_submitted_step->get_qt_var('answer')));

        //if we have an empty response, assume the default reference question
        if(empty($response))
            $wave = $question->get_reference_waveform();
        //otherwise, use the user's response
        else
            $wave = $question->waveform_from_response(array('answer' => $response), $incorrect_decorators);

        //start a new output buffer containing the question text
        $output = html_writer::tag('div', $question->format_questiontext($qa), array('class' => 'qtext'));

        //output the wave entry control
        $output .= html_writer::tag('div', $wave->render(true, true, $field_name), array('class' => 'ablock clearfix'));

        //if($last_submitted_step->get_qt_var('answer') != $last_step->get_qt_var('answer'))
        //    $output .= html_writer::tag('div', get_string('mayhavechanged', 'qtype_waveform'), array('class' => 'warning'));

        //and return the generated output
        return $output;

    }
}
