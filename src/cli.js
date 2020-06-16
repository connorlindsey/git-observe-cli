require("dotenv").config()
import arg from "arg"
import inquirer from "inquirer"
import axios from "axios"
import colors from "colors"

import { GET_USER } from "./query"

// parseArguments parses the CLI arguments into an object
function parseArguments(rawArgs) {
  const args = arg(
    {
      // Types
      "--contributors": [String],
      "--repos": [String],
      "--preset": String,

      // Aliases
      "-c": "--contributors",
      "-r": "--repos",
      "-p": "--preset",
    },
    {
      argv: rawArgs.slice(2),
    }
  )
  return {
    contributors: args["--contributors"],
    repos: args["--repos"],
    preset: args["--preset"],
  }
}

// promptForMissingOptions prompts for missing CLI arguments
async function promptForMissingOptions(options) {
  const questions = []
  if (!process.env.ACCESS_TOKEN) {
    questions.push({
      type: "input",
      name: "token",
      message: "Please provide a GitHub personal access token: ",
      default: null,
    })
  }

  // Skip asking for contributors and repos if default preset is selected
  if (options.preset !== "default") {
    if (!options.contributors) {
      questions.push({
        type: "checkbox",
        name: "contributors",
        message: "Who would you like to see contributions from?",
        choices: [
          "ankit-bhargava",
          "connorlindsey",
          "alolita",
          "Brandon-Kimberly",
          "HudsonHumphries",
        ],
      })
    }

    if (!options.repos) {
      questions.push({
        type: "checkbox",
        name: "repos",
        message: "Which repos would you like to see contributions from?",
        choices: [
          "open-telemetry/opentelemetry-cpp",
          "open-telemetry/opentelemetry-go",
          "open-telemetry/opentelemetry-java",
          "open-telemetry/opentelemetry-js",
          "open-telemetry/opentelemetry-python",
          "open-telemetry/opentelemetry-specification",
        ],
      })
    }
  }

  const answers = await inquirer.prompt(questions)
  return {
    ...options,
    contributors: options.contributors ||
      answers.contributors || ["HudsonHumphries", "connorlindsey"],
    repos: options.repos ||
      answers.repos || [
        "open-telemetry/opentelemetry-cpp",
        "open-telemetry/opentelemetry-java",
        "open-telemetry/opentelemetry-python",
      ],
    token: process.env.ACCESS_TOKEN || answers.token,
  }
}

function generateQuery({ contributors, repos }) {}

async function exectureQuery(token, query) {
  // TODO: Delete
  // Get current user from GraphQL api
  const URL = "https://api.github.com/graphql"
  let ret = { data: null, error: null }

  try {
    const response = await axios({
      url: URL,
      method: "post",
      data: {
        query: GET_USER,
      },
      headers: {
        Authorization: `bearer ${token}`,
      },
    })
    ret.data = response.data
  } catch (error) {
    ret.error = error
  }

  return ret
}

export async function cli(args) {
  let options = parseArguments(args)
  options = await promptForMissingOptions(options)

  if (!options.token) {
    console.log("Error: ".red.bold + "You must provide a GitHub personal access token.")
    process.exitCode = 1
    return
  }

  const query = generateQuery(options)
  const { data, error } = await exectureQuery(options.token, query)
  if (error) {
    console.error("Error: ".red + error)
  }
  console.log("data".green, JSON.stringify(data, null, 2))
}
