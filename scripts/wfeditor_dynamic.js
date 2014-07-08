/**
 * Waveform Editor - Dynamic Waveform Editor
 * (Allows the instructor to add or remove waveforms for a question base using AJAX.)
 */

const KEY_ESCAPE = 27;
const KEY_UP = 38;
const KEY_DOWN = 40;


var dymnamicBase = null;

var wfModRemove = false;

$.fn.exists = function () {
    return this.length !== 0;
}

//This little piece of namespace trickery allows us to 
//override functions from the core Waveform Editor, yet still use them.
var dyn_cancelAllMods = cancelAllMods;
cancelAllMods = function()
{
	dyn_cancelAllMods();
	wfModRemove = false;
	
	$('#modRemoveWave').removeClass('wfHighlighted');
}



function lastWave(waveset)
{
	return waveset.children('.wavecontainer:last');
}

function addDynamicWave()
{
	//create a copy of the dynamic base with data and events
	var newWave = dynamicBase.clone(true);
	
	newWave.find('input').val(autoname(parentWaveset($(this))));
	
	//and insert it after the last wave
	newWave.insertAfter(lastWave(parentWaveset($(this))));
	newWave.slideDown(100);
}

function waveName(wave)
{
	return $(wave).find('input').val().replace('|', '');
}

function autoname(waveset)
{
	var lastName = lastWave(waveset).find('input').val();
	
	if(lastName.length != 1)
		return 'a';
	
	return String.fromCharCode(lastName.charCodeAt(0) + 1);
}

/**
 * Extends the default wfClick to suppot wfModRemove.
 */
var base_wfClick = wfClick;
wfClick = function(e)
{
	//if modRemove is selected, then remove the given wave
	if(wfModRemove)
	{
		//remove the given wave, then, switch back to normal mode
		//this is inconsistent behavior, but follows the principle of least astonishment
		removeWave($(this).parents('.wavecontainer'));
		$('#modNormal').click();
		
	}
	//otherwise, handle the event normally
	else
		base_wfClick.call($(this), e);
}

function removeWave(item)
{
	//force a general reserialization after the item is hidden
	setTimeout("force_reserialize()", 200);
	
	//slide the wave out of sight, then delete it
	item.slideUp(100).promise(item.remove);
}

function force_reserialize()
{
	$('.wfQuickform').each(function() { saveWaveset($(this)); } );	
}

function modRemoveClick()
{
	cancelAllMods();
	
	wfModRemove = true;
	$('#modRemoveWave').addClass('wfHighlighted');
}



var dyn_wfMouseIn = wfMouseIn;
wfMouseIn = function()
{
	if(wfModRemove)
		$(this).parent('.wavecontainer').children('.wavecell').addClass('wfRemoveHover');
	else
		dyn_wfMouseIn.call(this);
	
}

var dyn_wfMouseOut = wfMouseOut;
wfMouseOut = function()
{
	$(this).parent('.wavecontainer').children('.wavecell').removeClass('wfRemoveHover');
	
	//call the base function
	dyn_wfMouseOut.call(this);
}

//disable static serialization
saveValues = function (container) {};



function dynamic_unserialize(container, waveset)
{
	//for each wave in the dynamic serialization array
	for(var i = 0; i < waveset.length; ++i)
	{

		var serialized = waveset[i].split('|');
		
		//split the name from the serialized array
		var name = serialized[0];
		serialized = serialized[1];		
		
		//the first time we execute, set the dynamic base to the proper length
		if(i==0)
		{
			//use the serialized format to compute how many items we have
			//two characters of type + comma
			var count = (serialized.length + 1) / 3;

			//and ensure the dynamic base has the correct amount of cells
			setDivisionCount(dynamicBase, count);
			
			//delete all existing wavecontainers, except for the dynamic base
			container.children('.wavecontainer:visible').remove();

		}

		//create a new wave from the dynamic base, and set its name
		var newWave = dynamicBase.clone(true);
		newWave.find('.dynamicName').val(name);
		
		//append it to the container, and set the new wave's value
		newWave.insertBefore(container.find('.waveCode'));
		newWave.show();
		unserializeWave(newWave, serialized);
		
		
	}
	
	//ensure the current serialization is up to date
	saveWaveset(container, true);
	
	//and reposition the toolbar
	setToolbarWidth.call(container);
}


function manualEditCode() {
    clearTimeout(wfCodeEditTimer);
    wfCodeEditTimer = setTimeout(wfApplyCode, 3);
    return true;
}

function wfApplyCode() {
    var newWaveSet = JSON.parse($('.waveCode').val());

    if(newWaveSet) {
        dynamic_unserialize($('.wfQuickform').first(), newWaveSet);
    }
}


function setDivisionCountFromField()
{
	setDivisionCount($(this), $('#wfIntervals').val());
}


function setDivisionCount(container, count)
{
	//store the original length

	var original = container.children().length - 1;
	var item = getChild(container, 1);;
	
	//resize the cells to fit, when appropriate
	autoResize(container, count);
	
	//if we need to add elements, do so
	if(original < count)
	{
		
		//create each additional element
		for(var i = 0; i < (count - original); ++i)
		{
			//create a new item, and append it to the end of the container
			var newChild = getChild(container, original).clone(true);
			var newClass = autoEquivalent(newChild);
			
			//switch to the automatic equivalent for the given class
			stripValueClass(newChild);
			newChild.addClass(newClass);
			
			//if(container.is(':visible'))
			//{
				newChild.hide();
				newChild.appendTo(container);
				newChild.fadeIn('slow');
			//}
			//otherwise, simply add them
			//else
			//{
			//	newChild.appendTo(container);
			//}
			
			//automatically expand the container as we expand
			if(newChild.offset().left + newChild.width() > container.parents('.wfQuickForm').width())
				container.parents('.wfQuickForm').css('min-width', (newChild.position().left + newChild.width()) + 'px');
			
			//get a reference to the newly added item
			item = getChild(container, original + i + 2);
			
			//set the new container to an automatic value
			stripValueClass(item);
			item.addClass('autoone');
		}
	}
	//if we need to remove elements
	else if(original > count)
	{
		//remove each element beyond the desired amount
		for(var i = original - 1; i >= count; --i)
		{
			var queued = getChild(container, i);
			
			/*
			if(container.is(':visible'))
				queued.fadeOut('slow').promise(queued.remove);
			//otherwise, simply remove it
			else
			*/
				queued.remove();
		}
	}
	
	//upkeep the waveform
	wfMaintenance(item);
	
	//and reposition the toolbar
	setToolbarWidth.call(container, true);
	
}



function incrementDuration()
{
	//increment the duration
	$('#wfIntervals').val(parseInt($('#wfIntervals').val()) + 1);
			
	//ensure we have a valid value
	validateDuration();
}

function validateDuration()
{
	//if the duration is invalid, replace it
	if(isNaN($('#wfIntervals').val()))
			$('#wfIntervals').val(divisionCount());	
}

function decrementDuration()
{
	//decrement the duration
	$('#wfIntervals').val(parseInt($('#wfIntervals').val()) - 1);
	
	//ensure we have a valid value
	validateDuration();
}



function handleKeysDuration(e)
{
	//trigger the OK button on ENTER
	if(e.keyCode==KEY_ENTER)
	{
		$('#btnDurationOk').click();
		return false;
	}
	
	//trigger the Increment button on UP
	if(e.keyCode==KEY_UP)
	{
		$('#btnIncrementDuration').click();
		return false;
	}
	
	//trigger the Increment button on UP
	if(e.keyCode==KEY_DOWN)
	{
		$('#btnDecrementDuration').click();
		return false;
	}
}

function captureInitialValue()
{
	//get a number corresponding to this waveset
	var index = $(this).parent().children('.wfQuickform').index($(this));
	
	//serialize the current waveset
	wfInitialValues[index] = serializeWaveset($(this));
}

function resetWaveset()
{
	//get a number corresponding to this waveset
	var index = $(this).parent().children('.wfQuickform').index($(this));

	dynamic_unserialize($(this), wfInitialValues[index]);
}

function resetAll()
{
	$('.wfQuickform').each(resetWaveset)
}

/**
* TODO: REDO ME (In fact, redo this whole script.)
*/ 
function toggleViewCodeClick() 
{
    
    var element = $('#toggleViewCode');

    if(element.hasClass('wfHighlighted')) {
        $('.waveCode').slideUp();
        $('#toggleViewCode').removeClass('wfHighlighted');
    } else {
        $('.waveCode').slideDown();
        $('#toggleViewCode').addClass('wfHighlighted');
    }

}


function wfDynamicInitialize()
{
	//establish an easy reference to the dynamic base wave
	dynamicBase = $('#dynamic_base_div');

	//toolbar button events
	$('#btnAddWave').click(addDynamicWave);
	$('#modRemoveWave').click(modRemoveClick);
    $('#toggleViewCode').click(toggleViewCodeClick);
    $('.waveCode').bind('keyup', manualEditCode);
    $('.waveCode').bind('paste', manualEditCode);
	$('#btnSetDuration').click(function() { $('#wfIntervals').val(divisionCount()); showAsPopup($('#wfPopupDuration'), $('#btnSetDuration')); $('#wfIntervals').focus() });
	
	//duration popup buttons
	$('#btnDurationCancel').click(killAllPopups);
	$('#btnDurationOk').click(function() { validateDuration(); $('.wavecontainer').each(setDivisionCountFromField); killAllPopups(); });
	$("#btnIncrementDuration").click(incrementDuration);
	$("#btnDecrementDuration").click(decrementDuration);
	
	//duration keypresses
	$('#wfIntervals').keypress(handleKeysDuration);
	
	//force reserialization on name edit
	$('.wavename').change(force_reserialize);
	$('#wfIntervals').val(divisionCount());
	
	
	$('.wfQuickform').each(captureInitialValue);
	
	//populate the input values on start
	force_reserialize();
}	

$(document).ready(wfDynamicInitialize);
