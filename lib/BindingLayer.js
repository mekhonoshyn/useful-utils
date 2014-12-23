/**
 The MIT License (MIT)

 Copyright (c) 2014 mekhonoshyn

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * created by mekhonoshyn on 21-Nov-14.
 */

function _BindingLayer(bTarget, bInterface) {
    var _bindingKey = _hash();

    function _bindModel(modelData, mapping, options) {
        var _options = options || {},
            _doOnUnbind;

        _options.doOnUnbind
            && (_doOnUnbind = _options.doOnUnbind)
            && (_options.doOnUnbind = function _onUnbindWrapper(propName, modelFieldName) {
                _doOnUnbind(propName, modelFieldName);

                _print('object`s [id:', _bindingKey, '] property "', propName, '" unbound from model field "', modelFieldName, '"');
            });

        _options.unbindingKey = _bindingKey;

        _ModelMgr.bindToModel(bInterface, modelData, mapping, _options);
    }

    function _unbindModel(modelName) {
        _ModelMgr.unbind(modelName, _bindingKey);
    }

    function _unbindAllModels() {
        _ModelMgr.boundTo(_bindingKey).forEach(_unbindModel);
    }

    function _invalidateModel(modelName, fieldNames) {
        _ModelMgr.invalidate(modelName, bInterface, fieldNames);
    }

    function _invalidateAllModels() {
        _ModelMgr.boundTo(_bindingKey).forEach(_invalidateModel);
    }

    function _boundTo(modelName) {
        return !!~_ModelMgr.boundTo(_bindingKey).indexOf(modelName);
    }

    bTarget.boundTo = _boundTo;
    bTarget.bindModel = _bindModel;
    bTarget.unbindModel = _unbindModel;
    bTarget.unbindAllModels = _unbindAllModels;
    bTarget.invalidateModel = _invalidateModel;
    bTarget.invalidateAllModels = _invalidateAllModels;
}