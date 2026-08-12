<#
.SYNOPSIS
Tests the shared infrastructure ARM templates are valid.

.DESCRIPTION
Search for and validate shared infrastructure arm templates.

To be considered for validation,  the shared template must:

    * be named `template.json`
    * have a parameter file called `test-parameters.json` in the same directory

The script wil test all templates from the base directory that match this criteria,
outputting all details if they are invalid and throwing an error if one or more templates are invalid.

.PARAMETER ResourceGroupName
The name of the resource group to test the ARM template against.

.PARAMETER BaseDirectory
The base directory to search for templates from


.EXAMPLE
Test-ArmTemplate.ps1 -ResourceGroup someResourceGroup -BaseDirectory c:\templates

#>
[CmdletBinding()]
Param(
    [Parameter(Mandatory=$true)]
    [string] $ResourceGroupName,
    [Parameter(Mandatory=$true)]
    [string] $BaseDirectory
)



function Get-TemplatesToTest  {
    param(
        [Parameter(Mandatory=$true)]
        [string] $BaseDirectory
    )    
    $templatesToTest = @()

    $templates = Get-ChildItem -Path $BaseDirectory -Recurse -Filter template.json

    foreach($template in $templates) {
        $testParamFile = Join-Path -Path $template.DirectoryName -ChildPath test-parameters.json

        if(Test-Path -Path $testParamFile) {
            $templatesToTest += @{
                TemplateFile = $template.FullName
                ParameterFile = $testParamFile
            }
        }
    }

    return $templatesToTest
}


Write-Host "Searching for templates to test.."
$templates =  Get-TemplatesToTest -BaseDirectory $BaseDirectory

$templateHasError = $false

foreach($template in $templates) {
    Write-Host "Testing template '$($template.TemplateFile)'"
    $DeploymentParameters = @{
        ResourceGroupName     = $ResourceGroupName
        TemplateFile          = $template.TemplateFile
        TemplateParameterFile = $template.ParameterFile
        Verbose               = $true
    }

    Write-Host "- Validating template"
    if ($PSCmdlet.MyInvocation.BoundParameters["Verbose"].IsPresent) {
    
        Write-Verbose -Message "Deployment Parameters:"
        $DeploymentParameters
    
    }
    $Result = Test-AzResourceGroupDeployment @DeploymentParameters

    if ($Result.Count -gt 0) {
        $Result
        foreach($detail in $Result.Details) { 
            $detail.Message

            foreach($detail in $detail.Details) {
                $detail | Format-Table | Out-String
            }
            
        }
    
        $templateHasError = $true
    }
}

if($templateHasError) {
    Write-Error "One or more templates has an error, exiting."
}