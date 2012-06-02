<?php
/**
 * Defines the editing form for the shortanswer question type.
 *
 * @package   qtype_vhdl
 * @copyright 2011 Binghamton University
 * @author 	  Kyle Temkin <ktemkin@binghamton.edu>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['addingwaveform'] = 'Adding a Logic Timing Diagram question';
$string['editingwaveform'] = 'Editing a Logic Timing Diagram question';
$string['waveform_link'] = 'question/type/waveform';

$string['waveform'] = 'Logic Timing Diagram';
$string['waveform_help'] = 'In response to a question (which may contain an image) and a waveform prompt, the respondent fills in blanks in the waveform prompt.';
$string['waveformsummary'] = 'An automatically-graded timing diagram quesiton for Digital Logic elements.';

$string['addwaveform'] = 'Add wave(s).';
$string['wavenames'] = 'Wave name(s)';
$string['intervals'] = 'Total intervals:';


$string['gradeoptions'] = 'Input/Grading Options';
$string['autofeedback'] = 'Automatic Feedback';
$string['feedback_perwave'] = 'Highlight the entirety of any wave with incorrect segments.';
$string['feedback_persegment'] = 'Highlight incorrect segments, which may be smaller than whole waves*. ';
$string['feedback_allornothing'] = 'Do not provide feedback other than correct or incorrect.';
$string['feedback_warning'] = '<em>*Per-segment feedback is not reccomended for most graded assignments, as it tends to give away the answer.</em>';

$string['partialcredit'] = 'Grading Method';
$string['grade_perwave'] = 'Give credit for each waveform which is completely correct.';
$string['grade_persegment'] = 'Give credit for each time division which is correct.';
$string['grade_allornothing'] = 'Give credit only if all of the waveforms are completely correct.';

$string['generateclock'] = 'Generate Clock:';
$string['time_high'] = 'Time High:';
$string['time_low'] = 'Time Low:';