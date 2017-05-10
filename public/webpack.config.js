module.exports = {
  context: __dirname,
  entry: {
      quizplayer: "./quizplayer.js"
  },
  output: {
    path: __dirname + "/dist",
      // Make sure to use [name] or [id] in output.filename
      //  when using multiple entry points
      filename: "[name].bundle.js",
      chunkFilename: "[id].bundle.js"
  }
}
