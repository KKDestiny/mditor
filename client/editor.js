/**
 * 定义编辑器类型
 **/
var Editor = module.exports = function (mditor) {
	var self = this;
	self.mditor = mditor;
	self.innerEditor = mditor.ui.editor;
	self._bindEvents();
	return self;
};

Editor.prototype.getValue = function () {
	var self = this;
	return self.innerEditor.val();
};

Editor.prototype.setValue = function (value) {
	var self = this;
	self.innerEditor.val(value);
	return self;
};

Editor.prototype.getActiveElement = function () {
	var self = this;
	self.innerEditor.focus();
	return document.activeElement;
};

Editor.prototype.getSelectRange = function () {
	var self = this;
	var box = self.getActiveElement();
	return {
		"start": box.selectionStart,
		"end": box.selectionEnd
	};
};

Editor.prototype.setSelectRange = function (start, end) {
	var self = this;
	var box = self.getActiveElement();
	box.setSelectionRange(start, end);
	return self;
};

Editor.prototype.getSelectText = function () {
	var self = this;
	var box = self.getActiveElement();
	var range = self.getSelectRange();
	return box.value.substring(range.start, range.end);
};

Editor.prototype.setSelectText = function (text) {
	var self = this;
	var box = self.getActiveElement();
	var range = self.getSelectRange();
	box.setRangeText(text);
	if (range.end == range.start) {
		self.setSelectRange(range.start, range.end + text.length);
	}
	self.innerEditor.trigger('input');
	return self;
};

Editor.prototype.wrapSelectText = function (before, after) {
	var self = this;
	before = (before !== null && before !== undefined) ? before : '';
	after = (after !== null && after !== undefined) ? after : '';
	var range = self.getSelectRange();
	var text = self.getSelectText();
	self.setSelectText(before + text + after);
	var newStart = range.start + before.length;
	var newEnd = range.end + before.length;
	self.setSelectRange(newStart, newEnd);
	return self;
};

Editor.prototype.getBeforeText = function (length) {
	var self = this;
	var range = self.getSelectRange();
	var end = range.start;
	var start = end - length;
	var value = self.getValue();
	return value.substring(start, end);
};

Editor.prototype.getBeforeFirstCharIndex = function (char) {
	var self = this;
	var range = self.getSelectRange();
	var end = range.start;
	var start = 0;
	var value = self.getValue();
	return value.substring(start, end).lastIndexOf(char);
};

Editor.prototype.getBeforeWord = function () {
	var self = this;
	var chars = [" ", "\t", self.mditor.EOL];
	var start = 0;
	chars.forEach(function (char) {
		var index = self.getBeforeFirstCharIndex(char);
		if (index + char.length > start) {
			start = index + char.length;
		}
	});
	var range = self.getSelectRange();
	var value = self.getValue();
	return value.substring(start, range.end);
};

Editor.prototype.getBeforeTextInLine = function () {
	var self = this;
	var start = self.getBeforeFirstCharIndex(self.mditor.EOL) + self.mditor.EOL.length;
	var range = self.getSelectRange();
	var value = self.getValue();
	return value.substring(start, range.end);
};

/**
 * 事件绑定方法
 **/
Editor.prototype.on = function (name, handler) {
	var self = this;
	self.innerEditor.on(name, handler.bind(self));
	return self;
};

/**
 * 事件解绑方法
 **/
Editor.prototype.off = function (name, handler) {
	var self = this;
	self.innerEditor.off(name, handler.bind(self));
	return self;
};

/**
 * 绑定事件
 **/
Editor.prototype._bindEvents = function (name, handler) {
	var self = this;
	// self.on('keydown', function (event) {
	// 	if (event.keyCode == 9) {
	// 		event.preventDefault();
	// 		var textarea = event.target;
	// 		var indent = '\t';
	// 		var start = textarea.selectionStart;
	// 		var end = textarea.selectionEnd;
	// 		var selected = window.getSelection().toString();
	// 		selected = indent + selected.replace(/\n/g, '\n' + indent);
	// 		textarea.value = textarea.value.substring(0, start) + selected + textarea.value.substring(end);
	// 		textarea.setSelectionRange(start + indent.length, start + selected.length);
	// 	}
	// });
	self.mditor.cmd.addIndent = function (event) {
		var me = this;
		var selectText = me.editor.getSelectText();
		if (selectText.length < 1) {
			me.editor.wrapSelectText(me.INDENT);
			return;
		}
		var textArray = selectText.split(me.EOL);
		var buffer = [];
		var lineCount = textArray.length - 1;
		textArray.forEach(function (line, index) {
			line = line.trim() != '' ? me.INDENT + line : line;
			if (index < lineCount || line.trim() != '') {
				buffer.push(line);
			}
		});
		me.editor.setSelectText(buffer.join(me.EOL) + me.EOL);
	};
	self.mditor.cmd.removeIndent = function (event) {

	};
	self.mditor.key('tab', 'addIndent');
	self.mditor.key('shift+tab', 'removeIndent');
	return self;
};
