# Tech Radar

Tech Radar is a technical landscape visualization app that helps engineering teams align on technology choices. It provides
a platform to share knowledge and experience in technologies, to reflect on technology decisions and continuously evolve
the technology landscape. This is a rewritten on Typescript [version from Zalando](https://github.com/zalando/tech-radar),
which in its own turn is based on the [pioneering work by ThoughtWorks](https://www.thoughtworks.com/radar).

### Requirements
* Node.js >= 18.8
* Yarn >= 1.22
* Typescript >= 4.8

## Running locally

Make sure you have `docker-compose` and `make` installed.
Clone the latest version and run:

```bash
$ make run  
```
then navigate to `http://localhost:8020/` with your favorite browser.

## Configuration

Main configuration file is `src/config.ts`. All entries (blips) have been placed in a separate file `src/entries.ts`.

## License

Tech Radar is licensed under MIT License. Please see [LICENSE](LICENSE) for details.
