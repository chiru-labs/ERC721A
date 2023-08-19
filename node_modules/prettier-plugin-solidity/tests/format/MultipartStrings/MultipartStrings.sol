contract MultipartStrings {
  bytes b1 = hex'beef';
  bytes b2 = hex"beef";
  bytes b3 = hex"beef" hex"c0ffee";
  bytes b4 = hex"beeeeeeeeeeeeeeeeeeeeeef" hex"c0000000000ffeeeeeeeeeeeeeeeeeee";

  string s1 = "foo";
  string s2 = "foo" "bar";
  string s3 = "foofoofoofooofoofoofofoooofofoo" "barbarbrabrbarbarbabrabrbabr";
}
