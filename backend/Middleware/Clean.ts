


class Clean {
  public inputs(input: string) {
    return input.trim().replace("\'", "");
  }
}

export default new Clean();