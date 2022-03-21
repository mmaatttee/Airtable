const CURRENT_REVISION = 1
const BIN_CHECK_API_KEY = "yEwyPE9eNPsTyntSYneTpUnKjsALOOk5"

//enum
const Subset_All = "All Records"
const Subset_ForTests = "Records for Test"
const Subset_CurrentView = "Records from Currently Visible View"
// const Subset_Last10Records = "Last 10 Records"

let settings = input.config({
    title: 'Run Validation for Families',
    description: ``,
    items: [
        input.config.select('chosenSubset', {
            label: "Affected Records",
            description: "Choose Subset for validation:",
            options:[
                {label: 'Records for Test', value: "Records for Test"},
                {label: 'Records from Currently Visible View', value: "Records from Currently Visible View"},
                // {label: 'Last 10 Records', value: "Last 10 Records"},
                {label: 'All Records', value:"All Records"}
            ]
        }),
        input.config.select('ignoreRevision', {
            label: 'Ignore Revision',
            description: "Everyone should choose - NO",
            options:[
                {label: 'NO', value: "0"},
                {label: 'Yes (I know what I do)', value: "1"},
            ]

        }),
        input.config.text('binCheckAPIKey', {
            label: 'Bin Check API Key',
            description: "Log in to acquire an API key https://apilayer.com/marketplace/description/bincheck-api"
        })
    ],
});

let table = base.getTable('Family Backlog')
const BIN_ID_FIELD = table.getField('Card Bin ID')
const BANKCARD_FIELD = table.getField('Bank Card Normalized')
let binCache

const validateCardNumber = number => {
    //Check if the number contains only numeric value  
    //and is of between 13 to 19 digits
    const regex = new RegExp("^[0-9]{13,19}$");
    if (!regex.test(number)){
        return 0;
    }
  
    return luhnCheck(number) ? 1 : -1;
}

const luhnCheck = val => {
    let checksum = 0; // running checksum total
    let j = 1; // takes value of 1 or 2

    // Process each digit one by one starting from the last
    for (let i = val.length - 1; i >= 0; i--) {
      let calc = 0;
      // Extract the next digit and multiply by 1 or 2 on alternative digits.
      calc = Number(val.charAt(i)) * j;

      // If the result is in two digits add 1 to the checksum total
      if (calc > 9) {
        checksum = checksum + 1;
        calc = calc - 10;
      }

      // Add the units element to the checksum total
      checksum = checksum + calc;

      // Switch the value of j
      if (j == 1) {
        j = 2;
      } else {
        j = 1;
      }
    }
  
    //Check if it is divisible by 10 or not.
    return (checksum % 10) == 0;
}

await main()

/**
 * checkBINCache
 * checked if a BIN record exists in the Bin Cache table
 */
function checkBINCache(bin) {
    if (bin in binCache)
    {
        return binCache[bin]
    }
    return null
}

/**
 * insertBINCacheRecord
 * stores a BIN check API response in the Bin Cache table
 */
async function insertBINCacheRecord(bin, response, country, isRejected) {
    const table = base.getTable('BIN Cache')
    await table.createRecordAsync({
        BIN: bin,
        Response: JSON.stringify(response),
        Country: country,
        "Is Rejected From Response" : isRejected
    })
    return {isValid: !isRejected, country: country}
}

/**
 * checkBIN
 * Runs an API request to attempt a BIN lookup
 * The object returned contains an error key to capture any possible network or HTTP failures
 * return Promise<Object{result, error}>
 */
async function checkBIN(bin, apikey) {
    let res
    try {
        res = await fetch(`https://lookup.binlist.net/${bin}`)
    } catch (err) {
        return {
            result: null,
            error: {
                status: 0,
                message: `Network request failed ${err}`
            }
        }
    }
    

    if (!res.ok) {
        return {
            result: null,
            error: {
                status: res.status,
                message: `API Request Failed ${await res.text()}`
            }
        }
    }

    return {
        result: await res.json(),
        error: null
    }
}

/**
 * checkBINMemo
 * wraps checkBIN with a caching table to reduce the risk of hitting API rate limits
 */
async function checkBINMemo(bin) {
    if (bin === "")
    {
        return {isValid: 0, country: null}
    }
    const cacheHit = checkBINCache(bin)
    if (cacheHit) {
        return cacheHit
    }
    
    let { result, error } = await checkBIN(bin, settings.binCheckAPIKey)
    // output.inspect(error)
    let hasState = !error || [400, 404].includes(error.status)
    let newCacheItem
    if (hasState) {
        let country = result ? result.country.name : null
        let isRejected = !country || country !== "Ukraine"
        await insertBINCacheRecord(bin, {
                result,
                error, 
                cached: true
            }, 
            country,
            isRejected
        )
        newCacheItem = {
            isValid: !isRejected,
            country: country
        }
    }
    else
    {
        newCacheItem = {
            isValid: -1, //API Rate limit
            country: ""
        }
    }
    binCache[bin] = newCacheItem
    return newCacheItem
}

async function main()
{
    let chosenSubset = settings.chosenSubset
    var ignoreRevision = Boolean(Number(settings.ignoreRevision))
    output.text(`Active Subset: "${chosenSubset}"\nIgnore Revision: ${ignoreRevision ? "Yes": "No"} `)
    
    var chosenRecords
    switch (chosenSubset){
        case Subset_ForTests:
            chosenRecords = (await table.getView('Family Backlog (Good for Tests)').selectRecordsAsync()).records
        break
        case Subset_CurrentView:
            if (cursor.activeTableId != table.id || cursor.activeViewId == null)
            {
                output.markdown("***Wrong active View. Either choose views from Family Backlog table or change Settings...***")
                output.markdown("Exiting for now.")
                return
            }
            let view = table.getView(cursor.activeViewId)
            output.text('Selecting records from: ' + view.name)
            chosenRecords = (await table.getView(view.id).selectRecordsAsync()).records
        break
        case Subset_All:
        default:
            chosenRecords = (await table.selectRecordsAsync()).records
        break
    }
    
    if (chosenRecords.length == 0)
    {
        output.markdown(`***No Records for chosen Subset. Maybe change Settings...***`)
        output.markdown("Exiting for now.")
        return
    }
    if (!ignoreRevision)
    {
        let curRevision = String(CURRENT_REVISION)
        chosenRecords = chosenRecords.filter((record) => {
            return record.getCellValueAsString('🧑‍💻 Revision of Validation') !== curRevision
        })
    }
    if (chosenRecords.length == 0)
    {
        output.markdown(`***No new records for validation.***`)
        output.markdown("Good bye.")
        return
    }
    else if(chosenRecords.length > 500)
    {
        let needToProceed = await input.buttonsAsync("This run is going to validate a lot of records(500+) Do you want to continue?", [
            {label: 'No', value: false},
            {label: 'Yes', value: true, variant: 'danger'}])
        if (!needToProceed)
        {
            output.markdown("NO. End of run.")
            return
        }
    }
    output.text("Starting Validation:")

    // output.inspect(chosenRecords)
    output.markdown(`*Processing ${chosenRecords.length} records...*`)

    let success = await preparePrerequisites()
    if (!success)
    {
        output.markdown("**Failed to prepare prerequisites. Terminated.**")
        return
    }

    let result = await processRecords(chosenRecords)

    output.markdown(`*Done. Updating columns in Airtable...*`)
    let i = 1
    while (result.length > 0) {
        if (i % 2 == 0) output.markdown(`* *Remaining: ${result.length} record(s)*`)
        await table.updateRecordsAsync(result.slice(0, 50));
        result = result.slice(50);
        i++
    }

    output.markdown(`**Updated ${chosenRecords.length} record(s). Validation executed without problems.**`)
}

async function processRecords(records)
{
    let result = []

    for (let i = 0; i< records.length;i++){
        let rec = records[i]
        
        let {rejectValues, warningValues, customFields, successfullyValidated} = await validateForRejectionsAndWarnings(rec)

        let rejectValue = rejectValues.map(option =>{ return {id: option}})
        let warningValue = warningValues.map(option =>{ return {id: option}})
        
        let fields = {
            '🧑‍💻 Revision of Validation' : successfullyValidated ? CURRENT_REVISION : -1,
            '🧑‍💻 Validation Date' : new Date(),
            'Rejection Flags': rejectValue,
            'Warning Flags': warningValue,       
        }
        result.push({id:rec.id,
            fields: {...fields, ...customFields}
        })
    }
    return result
}

// Load cache, extra data and so on here
async function preparePrerequisites(){

    //Load BIN ID cache
    const table = base.getTable('BIN Cache')
    let newCache = {};
    
    (await table.selectRecordsAsync({ fields: ['BIN', 'Is Valid', "Country"]})).records.forEach(r=> 
    {
        let bin = r.getCellValueAsString("BIN")
        let validValue = r.getCellValueAsString("Is Valid") // 1 or 0 values. -1 could be if API rate limit
        let countryValue = r.getCellValueAsString("Country")
        newCache[bin] = {isValid: validValue, country: countryValue} 
    })
    binCache = newCache

    // Add more prerequisites HERE

    return true
}

//Use app "Helper - Family - Get Flags Options" to get IDs of 'Multi Select' options
async function validateForRejectionsAndWarnings(record){
    let rejectValues = []
    let warningValues = []
    let customFields = {}
    let successfullyValidated = true

    //PHONE NUMBER
    let phoneNumber = String(record.getCellValueAsString('Phone Normalized'))

    if (phoneNumber.startsWith("7"))
    {
        rejectValues.push("selnM6Ph9uCTq6JRE") // Phone - Russian
    }

    if ((phoneNumber.startsWith('380') && phoneNumber.length != 12) ||
        phoneNumber.startsWith('0') && phoneNumber.length != 10)
    {
        rejectValues.push('selk8KcQYO9Hy8IsE') // Phone - Not Valid
    }

    if (!phoneNumber.startsWith("380") && !phoneNumber.startsWith("0")) 
    {
        warningValues.push("seliyVkZ0BPS9Q86i") // Phone - Not Ukrainian
    }
    // END of PHONE NUMBER

    // BANK CARD NUMBER
    let bankCard = record.getCellValueAsString(BANKCARD_FIELD)
    let localValidationRes = validateCardNumber(bankCard)
    if (localValidationRes != 1)
    {
        rejectValues.push('sel6eYe91zWVlSIiN') // Card - Invalid
        if (localValidationRes == -1)
        {
            rejectValues.push('selC8PGBjzaHnukYn') // Card - CheckSum Wrong
        }
    }
    else{
        const bin = record.getCellValueAsString(BIN_ID_FIELD)
        const binQuery = await checkBINMemo(bin)        
        if (binQuery.isValid != 1) 
        {
            rejectValues.push('sel6eYe91zWVlSIiN') // reject invalid BIN
        }
        
        if (binQuery.isValid != 1 && binQuery.country) 
        {
            warningValues.push('selOe1AYM4kxPHMWG') // warn about bin is not Ukrainian
        }

        if (binQuery.isValid == -1) 
        {
            warningValues.push('sel61roq6J7pYuRxC') // warn about BIN check API error
            successfullyValidated = false
        }
        customFields['Bank Card Country'] = binQuery.country
    }
    // END OF BANK CARD NUMBER
    
    return {rejectValues, warningValues, customFields, successfullyValidated}
}
