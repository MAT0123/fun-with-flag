"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { count, log } from "console";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";

export default function Home() {
  const [countryGuessed , setCountryGuessed] = useState<number>(0);
  const countryCodes: string[] = [
    "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
    "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR",
    "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC",
    "CO", "KM", "CG", "CD", "CK", "CR", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC",
    "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA",
    "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT",
    "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP",
    "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI",
    "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM",
    "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE",
    "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN",
    "PL", "PT", "PR", "QA", "RO", "RU", "RW", "RE", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS",
    "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS",
    "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO",
    "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU", "VE",
    "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"
  ];
  type Result = "correct" | "wrong" | "undecided";
  const [randomCountry , setRandomCountry] = useState<string>();
  const [attempt , setAttempt] = useState<string>("");

  const [wrong , setWrong] = useState<Result>("undecided");
  const [randomCountryIndex , setRandomCountryIndex] = useState<number>(0);
  const [correctCountry , setCorrectCountry] = useState<string>("");  
  const [isPending , setIsPending] = useState<boolean>(false);
  type CountryCodeMap = Record<string, string>;
 // todo , use react form action to submit the form
  async function validate(){
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
   
    
  const prompt = ` one is A2_FLAG which is country code (e.g ID , US ) , and USER_GUESED , your task is to validate if USER_GUESED is the similar with the A2_FLAG , typo is acceptable , USER_GUESED written in other language is also fine , abreviation is also fine , lower letter , all capitalize or anything doesnt matter , if no input given , return 0 and country is the correct country , 
   , DO NOT GIVE THE PYTHON CODE DAMN IT , 
  USER_GUESED = ${attempt} , A2_FLAG = ${randomCountry} , 
  return in format like this , 
   {
   correct : {1 or 0},
   country : {country name}
  } `;
  
    setIsPending(true);
    const result = await model.generateContent(prompt);
    setIsPending(false);
     const jsonData = JSON.parse(result.response.text().slice(7, -4));

    setCountryGuessed((e) => e + Number(jsonData.correct));

    if(jsonData.correct == 1){
      setWrong("correct");
  }
    else{
      setWrong("wrong");
  }
  setCorrectCountry(jsonData.country);

  console.log(result.response.text());
}
function deleteCountryByCode(code: string | ""): void {
  const index = countryCodes.findIndex(country => country === code);
  
  if (index !== -1) {
    countryCodes.splice(index, 1);
    console.log(`Country with code ${code} has been deleted.`);
  } else {
    console.log(`Country with code ${code} not found.`);
  }
}
  const status = useFormStatus();
  useEffect(() => {
    setRandomCountryIndex(Math.floor(Math.random() * countryCodes.length));
    setRandomCountry(countryCodes[randomCountryIndex]);
  }, []);

  function submit(){
    if (randomCountry) { 
       validate();
       setCorrectCountry("");
       deleteCountryByCode(randomCountry);
    } 
  }
  return (
    <div className="mx-auto flex flex-col justify-center items-center bg-gray-100 h-screen space-y-14">
      {
        
          <Image
            src={`https://countryflagsapi.netlify.app/flag/${randomCountry}.svg`}
            alt={"country flag"}
            width={250}
            height={150}
          />


      }

        <Input placeholder="Country name" className="w-72" onChange={(e) => {setAttempt(e.target.value)}} value={attempt}/>

        <div className="space-x-4 w-72 flex justify-between">
        <Button className="w-72" disabled={wrong == "undecided" || isPending == true  ? false : true} onClick={submit} >Submit</Button>
        <Button onClick={() => { setRandomCountry(countryCodes[Math.floor(Math.random() * countryCodes.length)]); deleteCountryByCode(randomCountry ?? ""); setAttempt("");  setWrong("undecided") ; 
        }} className={cn(
    "w-72", 
    wrong === "correct" ? "bg-green-500" : 
    wrong === "wrong" ? "bg-red-500" : 
    "bg-black"
  )} >Next</Button>

        </div>

        <p>Country guessed: {countryGuessed} / {countryCodes.length}</p>
{        wrong == "wrong" && 
                <Alert className="absolute bottom-2 w-72 right-2">
                <AlertTitle>Incorrect</AlertTitle>
                <AlertDescription>
                {`Incorrect , correct country is ${correctCountry}` }
                </AlertDescription>
              </Alert>
}

    </div>
  );
}
