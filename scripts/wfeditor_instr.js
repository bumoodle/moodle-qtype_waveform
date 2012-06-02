/**
 * Waveform Editor - Instructor Module 
 */


const KEY_SHIFT = 16;
const KEY_ENTER = 13;

var wfModLock = false;
var wfModUnlock = false;

//This little piece of namespace trickery allows us to 
//override functions from the core Waveform Editor, yet still use them.
var instr_cancelAllMods = cancelAllMods;
cancelAllMods = function()
{
	instr_cancelAllMods();
	wfModLock = false;
	wfModUnlock = false;

	$('#modLock, #modUnlock').removeClass('wfHighlighted');
}

/**
 * Returns the equivalent fixed class for the given element.
 * 
 * @param item A JQuery-wrapped object representing the given wavecell. 	
 * @returns {String} The name of the fixed class which represents the same value as the input object.
 */
function fixedEquivalent(item)
{
	if(item.hasClass('one') || item.hasClass('autoone')  || item.hasClass('fixedone'))
		return 'fixedone';
	else if(item.hasClass('zero')  || item.hasClass('autozero')  || item.hasClass('fixedzero'))
		return 'fixedzero';
	else if(item.hasClass('unknown')  || item.hasClass('autounknown')  || item.hasClass('fixedunknown'))
		return 'fixedunknown';
	else 
		return '';
}

/**
 * Shows an iteam as a popup.
 * @param item
 * @param posBase
 */
function showAsPopup(item, posBase)
{
	var pos = posBase.position();
	var width = posBase.width();
	
	const pad_x  = 8;
	const pad_y = 3;
	
	//show the select bar, close to the mouse
	item.css({ "left": (pos.left + width + pad_x) + "px", "top": (pos.top + pad_y) + "px" });
	item.slideDown(100);	
}



/**
 * @override Override for the instructor module.
 * 
 * Remove the wavecell's value.
 * 
 * @param item The JQuery object for the wavecell.
 */
function stripValueClass(item)
{
	item.removeClass(autoEquivalent(item));
	item.removeClass(fixedEquivalent(item));
	item.removeClass(coreClass(item));
}

/**
 * @override Override for the instructor module. 
 * 
 * Handles general keypresses, providing type hints.
 * @param e The keyevent that occurred.
 */
function modKeyDown(e)
{
	
	//if another item was pressed, remove its highlight
	//TODO: chain these
	if(wfLastMod != null)
	{
		wfLastMod.removeClass('wfHighlighted');
		wfLastMod = null;
	}

	//note the current modifier key
	if(((e.keyCode==KEY_CTRL && e.shiftKey) || (e.keyCode==KEY_SHIFT && e.ctrlKey)) && !wfModUnlock)
		wfLastMod = $('#modUnlock');
	else if(e.keyCode==KEY_CTRL && !wfModDelete) 
		wfLastMod = $('#modDelete');
	else if(e.keyCode==KEY_ALT && !wfModUnknown)
		wfLastMod = $('#modUnknown');
	else if(e.keyCode==KEY_SHIFT && !wfModLock)
		wfLastMod = $('#modLock');
	
	//highlight the appropriate modifier button for the key that's being pressed
	if(wfLastMod != null)
		wfLastMod.addClass('wfHighlighted');
}

function hasTransition(item)
{
	return item.hasClass('transition') || item.hasClass('autotransition') || item.hasClass('fixedtransition');
}

/**
 * Fix (or unfix) a given wavecell.
 * @param item	The jQuery-wrapped wavecell to work with.
 * @param fixed True to fix the wavecell, false to unfix.
 */
function setFixed(item, fixed)
{
	//if the user is trying to unlock an already unlocked item,
	//return to avoid the side effects of unlocking (point addition)
	if(!fixed && !isFixed(item))
		return;
	
	if(fixed)
		var newClass = fixedEquivalent(item);
	else if(!hasTransition(item))
		var newClass = autoEquivalent(item);
	else
		var newClass = coreClass(item);

	//strip the value from the item, and replace it with its fixed equivalent
	stripValueClass(item);
	item.addClass(newClass);				
}

/**
 * Handle wavecell clicks.
 */
function wfClick(e)
{
	
	hideSelectBar();
		
	//handle select first
	if(wfModSelect)
	{
		handleSelect($(this));
		wfMaintenance($(this));
		return;
	}
	
	//handle unlock requests
	if(wfModUnlock || (e.shiftKey && e.ctrlKey))
	{
		setFixed($(this), false);
		wfMaintenance($(this));
		return;
	}
	
	//determine if the item is fixed
	var fixed = isFixed($(this));
	
	//handle lock requests
	if((wfModLock || e.shiftKey) && !fixed)
		setFixed($(this), true);

	//toggle upon re-lock
	else if((wfModLock || e.shiftKey) && e.altKey && fixed )
	{
		forceUnknown($(this));
		setFixed($(this), true);
	}
	
	//toggle upon re-lock
	else if((wfModLock || e.shiftKey) && fixed )
	{
		setFixed($(this), false);
		toggleValue($(this));
		setFixed($(this), true);
	}
	
	//if the user has pressed the Unknown button, or is holding the Alt key, force unknown
	else if(wfModUnknown || e.altKey)
	{
		forceUnknown($(this));
		cancelSelect();
	}
	
	//if the user is holding CTRL, or has pressed the Delete button, unset the given value 
	else if(wfModDelete || e.ctrlKey)
	{
		unsetValue($(this));
		cancelSelect();
	}
	
	//otherwise, toggle
	else
	{
		toggleValue($(this));
		cancelSelect();
	}
	
	wfMaintenance($(this));
}

/**
 * Handles the click-event for the Instructor Lock button.
 */
function modLockClick()
{
	cancelAllMods();
	wfModLock = true;
	
	//highlight the appropriate button
	$('#modLock').addClass('wfHighlighted');
}

/**
 * Handles the click-event for the Instructor Unlock button.
 */
function modUnlockClick()
{
	cancelAllMods();
	wfModUnlock = true;

	//highlight the appropriate button
	$('#modUnlock').addClass('wfHighlighted');
}

/**
 * Hides all (in-page) popup windows.
 */
function killAllPopups()
{
	$('.wfPopup').slideUp(100);
}

function removeErrorsClock()
{
	$('#wfTimeHigh, #wfTimeLow').removeClass('incorrect');
}

function btnClockOkClick()
{
	var timeHigh = parseInt($('#wfTimeHigh').val());
	var timeLow = parseInt($('#wfTimeLow').val());
	

	//higlight and focus invalid values on error
	if(isNaN(timeLow))
	{
		$('#wfTimeLow').addClass('incorrect');
		$('#wfTimeLow').focus();
	}
	
	if(isNaN(timeHigh))
	{
		$('#wfTimeHigh').addClass('incorrect');
		$('#wfTimeHigh').focus();
	}
	
	//bail out if either error occurred
	if(isNaN(timeHigh) || isNaN(timeLow))
		return;
		
	//force the given range to represent a clock
	selectionForceClock(timeHigh, timeLow);
	
	//remove any previously invalidated input,
	//as it has since been validated
	removeErrorsClock();
	
	//and close the selectbar
	killAllPopups();
	cancelSelect();
}

var instr_wfKeyUp = wfKeyUp;
wfKeyUp = function(e)
{
	if(e.keyCode == KEY_ESCAPE)
		killAllPopups();
	
	instr_wfKeyUp.call(this, e);
}

function selectionForceClock(timeHigh, timeLow)
{
	var child;
	
	//get a reference to the container, and last object
	var contianer = selectionStart().parent();
	var endIndex = getTimeIndex(selectionEnd());
		
	//initialize variables used for generating the clock
	var count = 0;
	var high = true;
	
	//for each value in the selected range
	for(var i = getTimeIndex(selectionStart()); i <= endIndex; ++i)
	{
		//get a quick reference to the child, and remove its value
		child = getChild(contianer, i);
		stripValueClass(child);
		
		//if we're currently supposed to be outputting high,
		if(high)
		{
			
			//set the value to a fixed high
			child.addClass('fixedone');
			
			//switch to low when appropriate
			if(++count >= timeHigh)
			{
				high = false;
				count = 0;
			}
				
		}
		//otherwise, we should be outputting low
		else
		{
			//so set the value to fixed low
			child.addClass('fixedzero');
			const KEY_ENTER = 13;
			//and switch to high when appropritate
			if(++count >= timeLow)
			{
				high = true;
				count = 0;
			}
		}
	}
	
	//perform standard wave maintenance
	wfMaintenance(child);
}

function disableEnter(e)
{
	//prevent the enter key's action from propogating
	//(this prevents auto-submit on enter mishaps)
	if(e.keyCode == KEY_ENTER)
		return false;
}

function handleKeypressClock(e)
{
	if(e.keyCode == KEY_ENTER)
	{
		$('#btnClockOk').click();
		return false;
	}
}

function wfInstrInitialize()
{
	//toolbar buttons
	$('#modLock').click(modLockClick);
	$('#modUnlock').click(modUnlockClick);
	
	//selectbar buttons
	$('#btnLock').click(function() { eachSelectedFinal(function(x) { setFixed(x, true)}) });
	$('#btnUnlock').click(function() { eachSelectedFinal(function(x) { setFixed(x, false)}) });
	$('#btnClock').click(function() { hideSelectBar();  showAsPopup($('#wfPopupClock'), selectionEnd()); });
	$('#btnClockOk').click(btnClockOkClick);
	$('#btnClockCancel').click(function() { killAllPopups(); cancelSelection(); })
	
	$('#wfTimeHigh, #wfTimeLow').keypress(handleKeypressClock);
	
	$('.wfPopup').find('input').keypress(disableEnter);
}

//add the Instructor Initialization to the initialization queue
$(document).ready(wfInstrInitialize);