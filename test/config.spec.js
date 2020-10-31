/* eslint-disable mocha/no-hooks-for-single-case */

const { assert, expect } = require('chai')
const rewireMock = require('rewiremock/node')

rewireMock.enable()

rewireMock('fs').by('./mocks/fs')

const Config = require('../lib')

describe('Instantiating configuration object', function () {
  it('Instantiate configuration object without specifying configuration files', function () {
    assert.throws(() => {
      let config = new Config()
    }, 'No configuration file(s) specified', 'no or non-expected error has been thrown')
  })
})

describe('Configuration file tests', function () {
  var config
  var data

  before(function () {
    config = new Config([
      'file1',
      'file2',
      'filea',
      'file3'
    ])
  })

  it('load configuration files without setting the ignoreNonExisting option', async function () {
    let errorName

    try {
      await config.load()
    } catch (error) {
      errorName = error.name
    }

    assert.strictEqual(errorName, 'NonExistentError', 'no or wrong error thrown')    
  })

  it('load configuration files with the ignoreNonExisting option set to false', async function () {
    let errorName

    try {
      await config.load({ ignoreNonExisting: false })
    } catch (error) {
      errorName = error.name
    }

    assert.strictEqual(errorName, 'NonExistentError', 'no or wrong error thrown')    
  })

  it('load configuration files with the ignoreNonExisting option set to true', async function () {
    let errorName

    try {
      data = await config.load({ ignoreNonExisting: true })
    } catch (error) {
      errorName = error.name
    }

    assert.strictEqual(errorName, undefined, 'an error was thrown')    
  })

  it('check resulting config', function () {
    assert.strictEqual(data.file1Param, 'success', 'parameter file1Param is not correct')
    assert.strictEqual(data.file2Param, 'success', 'parameter file2Param is not correct')
    assert.strictEqual(data.file3Param, 'success', 'parameter file3Param is not correct')
    assert.strictEqual(data.param.value, 5, 'parameter param.value is not correct')
    assert.strictEqual(data.param.file1Param, 1, 'parameter param.file1Param is not correct')
    assert.strictEqual(data.param.file2Param, 2, 'parameter param.file2Param is not correct')
    assert.strictEqual(data.param.file3Param, 3, 'parameter param.file3Param is not correct')
    assert.strictEqual(data.nested.level1, 1, 'parameter nested.level1 is not correct')
    assert.strictEqual(data.nested.level.level2, 2, 'parameter nested.level.level2 is not correct')
  })

  it('check the config to be persisted', function () {
    assert.strictEqual(config._toBePersisted.file1Param, undefined, 'parameter file1Param is not correct')
    assert.strictEqual(config._toBePersisted.file2Param, undefined, 'parameter file2Param is not correct')
    assert.strictEqual(config._toBePersisted.file3Param, 'success', 'parameter file3Param is not correct')
    assert.strictEqual(config._toBePersisted.param.value, 5, 'parameter param.value is not correct')
    assert.strictEqual(config._toBePersisted.param.file1Param, undefined, 'parameter param.file1Param is not correct')
    assert.strictEqual(config._toBePersisted.param.file2Param, undefined, 'parameter param.file2Param is not correct')
    assert.strictEqual(config._toBePersisted.param.file3Param, 3, 'parameter param.file3Param is not correct')
    assert.strictEqual(config._toBePersisted.nested.level1, 1, 'parameter nested.level1 is not correct')
    assert.strictEqual(config._toBePersisted.nested.level.level2, 2, 'parameter nested.level.level2 is not correct')
  })

  it('get specific parameters', function () {
    assert.strictEqual(config.get('file1Param'), 'success', 'file1Param is not correct')
    assert.strictEqual(config.get('param.value'), 5, 'param.value is not correct')
    assert.strictEqual(config.get('nested.level.level2'), 2, 'nested.level.level2 is not correct')
  })

  it('get specific parameters with custom separator', function () {
    assert.strictEqual(config.get('file1Param', '/'), 'success', 'file1Param is not correct')
    assert.strictEqual(config.get('param/value', '/'), 5, 'param.value is not correct')
    assert.strictEqual(config.get('nested/level/level2', '/'), 2, 'nested.level.level2 is not correct')
  })

  it('set parameters', function () {
    config.set('param.newValue', 6)
    config.set('newTop', 4)

    assert.strictEqual(config._data.param.newValue, 6, '_data.param.newValue is not correct')
    assert.strictEqual(config._toBePersisted.param.newValue, 6, '_toBePersisted.param.newValue is not correct')
    assert.strictEqual(config._data.newTop, 4, '_data.newTop is not correct')
    assert.strictEqual(config._toBePersisted.newTop, 4, '_toBePersisted.newTop is not correct')
  })

  it('delete parameters', function () {
    config.delete('param.newValue')
    config.delete('newTop')

    assert.strictEqual(config._data.param.newValue, undefined, 'data.param.newValue is not correct')
    assert.strictEqual(config._toBePersisted.param.newValue, undefined, '_toBePersisted.param.newValue is not correct')
    assert.strictEqual(config._data.newTop, undefined, 'data.newTop is not correct')
    assert.strictEqual(config._toBePersisted.newTop, undefined, '_toBePersisted.newTop is not correct')
  })
})
