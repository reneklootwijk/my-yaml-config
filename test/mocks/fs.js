const files = {
  file1: `
          file1Param: success
          param:
            value: 3
            file1Param: 1
        `,
  file2: `
          file2Param: success
          param:
            value: 4
            file2Param: 2
        `,
  file3: `
        file3Param: success
        param:
          value: 5
          file3Param: 3
        nested:
          level1: 1
          level:
            level2: 2
      `
}

exports.existsSync = (file) => {
  if (!files[file]) {
    return false
  }

  return true
}

exports.readFileSync = (file) => {
  if (!files[file]) {
    return
  }

  return files[file]
}
