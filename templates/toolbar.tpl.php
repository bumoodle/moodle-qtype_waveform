<div class="wfToolbar mainToolbar">
	<input type="button" class="wfToolbarButton wfHighlighted modNormal" alt="Add Point" title="Add Point"/>
	<input type="button" class="wfToolbarButton modDelete" alt="Erase Points [Ctrl]" title="Erase Points [Ctrl+Click]"/>
	<input type="button" class="wfToolbarButton modUnknown" alt="Force Unknown [Alt+Click]" title="Force Unknown [Alt+Click]" />

	<?php /* <span class="wfToolbarSeperator"></span><input type="button" class="wfToolbarButton modSelect " alt="Select Range" title="Select Range" />  */ ?>

	<span class="wfToolbarSeperator"></span>
	<?php
		if($instructor_mode)
		{
	?>
		<input type="button" class="wfToolbarButton"  alt="Lock Segment (Shift+Click)" title="Lock Segment (Shift+Click)" id="modLock"/>
		<input type="button" class="wfToolbarButton" alt="Unlock Segment (Ctrl+Shift+Click)" title="Unlock Segment (Ctrl+Shift+Click)" id="modUnlock"/>
		<span class="wfToolbarSeperator"></span>
	<?php
		}
	?>
	<input type="button" class="wfToolbarButton btnReset" alt="Reset Question" title="Reset Question">
	<input type="button" class="wfToolbarButton btnHelp" alt="Help" title="Help">
	
	<?php 
		if ($dynamic_edit)
		{
	?>
		<span class="wfToolbarSeperator"></span>
		<input type="button" class="wfToolbarButton" alt="Set Duration" title="Set Duration" id="btnSetDuration">
		<span class="wfToolbarSeperator"></span>
		<input type="button" class="wfToolbarButton" alt="Add Wave" title="Add Wave" id="btnAddWave">
		<input type="button" class="wfToolbarButton" alt="Remove Wave" title="Remove Wave" id="modRemoveWave">
		<span class="wfToolbarSeperator"></span>
		<input type="button" class="wfToolbarButton" alt="View Raw Code" title="View Raw Code" id="toggleViewCode">
		
	<?php 
		}
	?>
	
</div>

<div id="wfSelectbar" class="wfToolbar">
	<input type="button" class="wfToolbarButton" alt="Erase All Points" title="Erase Selected Points" id="btnDelete" />
	<span class="wfToolbarSeperator"></span>
	<input type="button" class="wfToolbarButton" id="btnUnknown" alt="Force Unknown" title="Force Unknown" />
	<input type="button" class="wfToolbarButton" id="btnHigh" alt="Force High" title="Force High" />
	<input type="button" class="wfToolbarButton" id="btnLow" alt="Force Low" title="Force Low" />
	<?php
		if($instructor_mode)
		{
	?>
		<span class="wfToolbarSeperator"></span>
		<input type="button" class="wfToolbarButton"  alt="Lock Segment" title="Lock Selected" id="btnLock"/>
		<input type="button" class="wfToolbarButton" alt="Unlock Segment" title="Unlock Selected" id="btnUnlock"/>
		<span class="wfToolbarSeperator"></span>
		<input type="button" class="wfToolbarButton" alt="Fill With Clock" title="Fill With Clock" id="btnClock" />
		
	<?php
		}
	?>
	<span class="wfToolbarSeperator"></span>
	<input type="button" class="wfToolbarButton" id="btnCancelSelect" alt="Cancel Selection" title="Cancel Selection" />
</div>

<?php 

if($dynamic_edit)
{
	?>
	<div id="wfPopupDuration" class="wfPopup">
		<label for="wfIntervals" class="wfLabel"><?php echo get_string('intervals', 'qtype_waveform'); ?></label>
		<input type="text" class="wfNumeric" id="wfIntervals" name="wfIntervals" size="2">
		<input type="button" class="plus" value="+" id="btnIncrementDuration" alt="Increment" title="Increment"> <input type="button" class="minus" value="-"  id="btnDecrementDuration" alt="Decrement" title="Decrement">
		<input type="button" class="wfToolbarButton"  alt="Set Duration" title="Set Duration" id="btnDurationOk"/>
		<input type="button" class="wfToolbarButton" alt="Cancel" title="Cancel" id="btnDurationCancel"/>
	</div>
	<?php 
}

if($instructor_mode)
{

	?>
	<div id="wfPopupClock" class="wfPopup">
		<big><?php echo get_string('generateclock', 'qtype_waveform'); ?></big><br/><br />
		<label for="wfTimeHigh" class="wfLabel"><?php echo get_string('time_high', 'qtype_waveform'); ?></label>
		<input type="text" class="wfNumeric" id="wfTimeHigh" name="wfTimeHigh" size="2"  value="2">
		<br />
		<label for="wfTimeLow" class="wfLabel"><?php echo get_string('time_low', 'qtype_waveform'); ?></label>
		<input type="text" class="wfNumeric" id="wfTimeLow" name="wfTimeLow" size="2" value="2">
		<br /><br />
		<input type="button" class="wfToolbarButton"  alt="Create Clock" title="Create Clock" id="btnClockOk"/>
		<input type="button" class="wfToolbarButton" alt="Cancel" title="Cancel" id="btnClockCancel"/>
	</div>
	
	
	<?php 	
}
?>
