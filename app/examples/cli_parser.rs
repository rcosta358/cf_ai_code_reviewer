use std::env;

struct Config {
    input: String,
    output: String,
    verbose: bool,
    retries: u32,
}

fn parse_args(args: Vec<String>) -> Config {
    let mut input = String::new();
    let mut output = String::from("report.txt");
    let mut verbose = false;
    let mut retries = 3;

    let mut index = 1;
    while index < args.len() {
        if args[index] == "--input" {
            input = args[index + 1].clone();
            index += 2;
        } else if args[index] == "--output" {
            output = args[index + 1].clone();
            index += 2;
        } else if args[index] == "--verbose" {
            verbose = true;
            index += 1;
        } else if args[index] == "--retries" {
            retries = args[index + 1].parse().unwrap();
            index += 2;
        } else {
            println!("Ignoring unknown option: {}", args[index]);
            index += 1;
        }
    }

    Config {
        input,
        output,
        verbose,
        retries,
    }
}

fn main() {
    let config = parse_args(env::args().collect());

    if config.verbose {
        println!("Reading {} and writing {}", config.input, config.output);
    }

    println!("Retries: {}", config.retries);
}
